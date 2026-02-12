import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { CertificateService, ParsedCertificate } from '../certificate.service';

/**
 * XML Digital Signature Service
 * Implements XML-DSig for NFe according to SEFAZ specifications
 */
@Injectable()
export class XmlSignerService {
    private readonly logger = new Logger(XmlSignerService.name);

    constructor(private readonly certificateService: CertificateService) { }

    /**
     * Sign NFe XML using company certificate
     */
    async signNFeXml(xml: string, companyId: string): Promise<string> {
        const password = this.certificateService.getPassword();
        const parsed = await this.certificateService.loadFromStorage(companyId, password);

        return this.signXml(xml, parsed, 'NFe');
    }

    /**
     * Sign any XML with the provided certificate
     * @param xml The XML string to sign
     * @param parsed The parsed certificate
     * @param referenceId The element ID to sign (without # prefix)
     */
    signXml(xml: string, parsed: ParsedCertificate, referenceId: string): string {
        try {
            // Find the element to sign
            const idAttrRegex = new RegExp(`Id="(${referenceId}[^"]*)"`, 'i');
            const match = xml.match(idAttrRegex);

            if (!match) {
                throw new BadRequestException(`Element with Id containing "${referenceId}" not found in XML`);
            }

            const fullId = match[1];
            this.logger.debug(`Signing element with Id: ${fullId}`);

            // Calculate digest of the referenced element
            const digestValue = this.calculateDigest(xml, fullId);

            // Build SignedInfo
            const signedInfo = this.buildSignedInfo(fullId, digestValue);

            // Sign the SignedInfo
            const signatureValue = this.signData(signedInfo, parsed.privateKey);

            // Get certificate in base64
            const certBase64 = this.getCertificateBase64(parsed.certificate);

            // Build complete Signature element
            const signatureElement = this.buildSignatureElement(signedInfo, signatureValue, certBase64);

            // Insert signature into XML (after the signed element's closing tag or before </NFe>)
            const signedXml = this.insertSignature(xml, signatureElement, referenceId);

            return signedXml;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error('XML signing failed:', error.message);
            throw new BadRequestException(`Falha ao assinar XML: ${error.message}`);
        }
    }

    /**
     * Calculate SHA-256 digest of the referenced element
     */
    private calculateDigest(xml: string, elementId: string): string {
        // Extract the element content (canonicalized)
        const elementContent = this.extractElement(xml, elementId);

        // Apply C14N canonicalization (simplified - remove XML declaration, normalize whitespace)
        const canonicalized = this.canonicalize(elementContent);

        // Calculate SHA-256 hash
        const hash = crypto.createHash('sha256');
        hash.update(canonicalized, 'utf8');

        return hash.digest('base64');
    }

    /**
     * Extract element by Id from XML
     */
    private extractElement(xml: string, elementId: string): string {
        // Find the element with the specified Id
        const idPattern = new RegExp(`(<[^>]+Id="${elementId}"[^>]*>)`, 'i');
        const startMatch = xml.match(idPattern);

        if (!startMatch) {
            throw new BadRequestException(`Element with Id="${elementId}" not found`);
        }

        const startTag = startMatch[1];
        const tagName = startTag.match(/<(\w+)/)?.[1];

        if (!tagName) {
            throw new BadRequestException('Could not extract tag name');
        }

        // Find complete element including content and closing tag
        const startIndex = xml.indexOf(startMatch[0]);
        const closingTag = `</${tagName}>`;
        const endIndex = xml.indexOf(closingTag, startIndex) + closingTag.length;

        return xml.substring(startIndex, endIndex);
    }

    /**
     * Simple C14N canonicalization for NFe
     */
    private canonicalize(xml: string): string {
        // Remove XML declaration
        let canonical = xml.replace(/<\?xml[^?]*\?>/g, '');

        // Normalize line endings
        canonical = canonical.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Remove leading/trailing whitespace from text nodes (simplified)
        canonical = canonical.replace(/>\s+</g, '><');

        // Ensure consistent attribute quoting (double quotes)
        canonical = canonical.replace(/'/g, '"');

        return canonical.trim();
    }

    /**
     * Build SignedInfo XML element
     */
    private buildSignedInfo(referenceUri: string, digestValue: string): string {
        return `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">` +
            `<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>` +
            `<SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>` +
            `<Reference URI="#${referenceUri}">` +
            `<Transforms>` +
            `<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>` +
            `<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>` +
            `</Transforms>` +
            `<DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>` +
            `<DigestValue>${digestValue}</DigestValue>` +
            `</Reference>` +
            `</SignedInfo>`;
    }

    /**
     * Sign data using RSA-SHA256
     */
    private signData(data: string, privateKey: forge.pki.PrivateKey): string {
        // Convert to PEM for Node.js crypto
        const keyPem = forge.pki.privateKeyToPem(privateKey);

        // Create signature
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(data, 'utf8');
        sign.end();

        const signature = sign.sign(keyPem, 'base64');

        return signature;
    }

    /**
     * Get certificate as base64 (without headers)
     */
    private getCertificateBase64(certificate: forge.pki.Certificate): string {
        const pem = forge.pki.certificateToPem(certificate);

        // Remove PEM headers and newlines
        return pem
            .replace('-----BEGIN CERTIFICATE-----', '')
            .replace('-----END CERTIFICATE-----', '')
            .replace(/\s/g, '');
    }

    /**
     * Build complete Signature element
     */
    private buildSignatureElement(
        signedInfo: string,
        signatureValue: string,
        certificateBase64: string,
    ): string {
        return `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">` +
            signedInfo +
            `<SignatureValue>${signatureValue}</SignatureValue>` +
            `<KeyInfo>` +
            `<X509Data>` +
            `<X509Certificate>${certificateBase64}</X509Certificate>` +
            `</X509Data>` +
            `</KeyInfo>` +
            `</Signature>`;
    }

    /**
     * Insert signature element into XML
     */
    private insertSignature(xml: string, signature: string, referenceId: string): string {
        // For NFe, insert signature before closing </infNFe> tag
        const closingPattern = new RegExp(`(</inf${referenceId.replace('inf', '')}>)`, 'i');
        const match = xml.match(closingPattern);

        if (match) {
            return xml.replace(match[0], `${signature}${match[0]}`);
        }

        // Fallback: insert before </NFe>
        return xml.replace('</NFe>', `${signature}</NFe>`);
    }

    /**
     * Verify XML signature (for testing/validation)
     */
    verifySignature(signedXml: string): boolean {
        try {
            // Extract signature elements
            const signatureMatch = signedXml.match(/<Signature[^>]*>([\s\S]*?)<\/Signature>/);
            if (!signatureMatch) {
                return false;
            }

            const signatureBlock = signatureMatch[0];

            // Extract DigestValue
            const digestMatch = signatureBlock.match(/<DigestValue>([^<]+)<\/DigestValue>/);
            if (!digestMatch) {
                return false;
            }

            // Extract Reference URI
            const uriMatch = signatureBlock.match(/URI="#([^"]+)"/);
            if (!uriMatch) {
                return false;
            }

            const referenceUri = uriMatch[1];
            const expectedDigest = digestMatch[1];

            // Calculate actual digest (excluding signature)
            const xmlWithoutSig = signedXml.replace(signatureBlock, '');
            const actualDigest = this.calculateDigest(xmlWithoutSig, referenceUri);

            // Compare digests
            return expectedDigest === actualDigest;
        } catch (error) {
            this.logger.warn('Signature verification failed:', error.message);
            return false;
        }
    }
}
