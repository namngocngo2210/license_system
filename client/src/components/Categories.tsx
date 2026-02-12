import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Category } from '../types';

const Categories: React.FC = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<{ id: number | null, name: string, description: string }>({ id: null, name: '', description: '' });

    const fetchCategories = async () => {
        try {
            const res = await api.get<Category[]>('/categories/');
            setCategories(res.data);
        } catch (error) {
            toast.error(t('categories.no_data'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openModal = (category: Category | null = null) => {
        if (category) {
            setIsEditing(true);
            setFormData({ id: category.id, name: category.name, description: category.description || '' });
        } else {
            setIsEditing(false);
            setFormData({ id: null, name: '', description: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && formData.id) {
                await api.put(`/categories/${formData.id}/`, { name: formData.name, description: formData.description });
                toast.success(t('categories.success_update'));
            } else {
                await api.post('/categories/', { name: formData.name, description: formData.description });
                toast.success(t('categories.success_create'));
            }
            setModalOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('categories.delete_confirm'))) return;
        try {
            await api.delete(`/categories/${id}/`);
            toast.success(t('categories.success_delete'));
            fetchCategories();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
                <Button onClick={() => openModal()}>
                    <Plus className="mr-2 h-4 w-4" /> {t('categories.add_new')}
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('categories.name')}</TableHead>
                                <TableHead>{t('categories.description')}</TableHead>
                                <TableHead className="text-right w-[120px]">{t('categories.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">{t('categories.no_data')}</TableCell>
                                </TableRow>
                            ) : (
                                categories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium" data-label={t('categories.name')}>{cat.name}</TableCell>
                                        <TableCell data-label={t('categories.description')}>{cat.description || '-'}</TableCell>
                                        <TableCell className="text-right" data-label={t('categories.actions')}>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal(cat)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? t('categories.edit_title') : t('categories.new_title')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">{t('categories.name')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="description">{t('categories.description')}</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>{t('categories.cancel')}</Button>
                            <Button type="submit">{isEditing ? t('categories.update') : t('categories.create')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Categories;
