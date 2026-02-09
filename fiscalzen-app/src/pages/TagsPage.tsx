import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Plus, MoreHorizontal, Tags, Pencil, Trash2 } from 'lucide-react';

interface Tag {
    id: string;
    nome: string;
    cor: string;
    contagem: number;
}

const COLORS = [
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Laranja', value: '#f97316' },
    { name: 'Amarelo', value: '#eab308' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Cinza', value: '#6b7280' },
];

// Mock data
const mockTags: Tag[] = [
    { id: '1', nome: 'Urgente', cor: '#ef4444', contagem: 12 },
    { id: '2', nome: 'Pendente', cor: '#f97316', contagem: 8 },
    { id: '3', nome: 'Revisado', cor: '#22c55e', contagem: 45 },
    { id: '4', nome: 'Arquivado', cor: '#6b7280', contagem: 120 },
];

export function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(COLORS[0].value);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            // TODO: Replace with API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setTags(mockTags);
        } catch {
            toast.error('Erro ao carregar tags');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newTagName.trim()) {
            toast.error('Nome da tag é obrigatório');
            return;
        }

        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingTag) {
                setTags(tags.map(t => t.id === editingTag.id ? { ...t, nome: newTagName, cor: newTagColor } : t));
                toast.success('Tag atualizada');
            } else {
                const newTag: Tag = {
                    id: Date.now().toString(),
                    nome: newTagName,
                    cor: newTagColor,
                    contagem: 0,
                };
                setTags([...tags, newTag]);
                toast.success('Tag criada');
            }

            resetForm();
        } catch {
            toast.error('Erro ao salvar tag');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setTags(tags.filter(t => t.id !== id));
            toast.success('Tag removida');
        } catch {
            toast.error('Erro ao remover tag');
        }
    };

    const openEditDialog = (tag: Tag) => {
        setEditingTag(tag);
        setNewTagName(tag.nome);
        setNewTagColor(tag.cor);
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingTag(null);
        setNewTagName('');
        setNewTagColor(COLORS[0].value);
        setDialogOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tags</h1>
                    <p className="text-muted-foreground">Organize suas notas fiscais com tags personalizadas</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTag ? 'Editar Tag' : 'Nova Tag'}</DialogTitle>
                            <DialogDescription>
                                {editingTag ? 'Atualize o nome e a cor da tag' : 'Crie uma nova tag para organizar suas notas'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome da Tag</label>
                                <Input
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Ex: Urgente, Revisado..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cor</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setNewTagColor(color.value)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${newTagColor === color.value ? 'border-foreground scale-110' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-sm font-medium">Prévia</label>
                                <div className="mt-2">
                                    <Badge style={{ backgroundColor: newTagColor }} className="text-white">
                                        {newTagName || 'Nome da tag'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingTag ? 'Salvar' : 'Criar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Tags className="h-5 w-5" />
                        <CardTitle>Suas Tags</CardTitle>
                    </div>
                    <CardDescription>{tags.length} tag(s) cadastrada(s)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tag</TableHead>
                                <TableHead>Notas Vinculadas</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tags.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Nenhuma tag cadastrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tags.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell>
                                            <Badge style={{ backgroundColor: tag.cor }} className="text-white">
                                                {tag.nome}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{tag.contagem} nota(s)</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(tag.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
