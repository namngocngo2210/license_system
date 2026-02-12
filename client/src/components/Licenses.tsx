import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Trash2, Plus, Copy, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { Label } from "./ui/label"
import { Card, CardContent } from "./ui/card"
import { License, Category, PaginatedResponse } from '../types';
import { cn } from "../lib/utils";

const StatusBadge: React.FC<{ status: 'used' | 'active' | 'inactive' }> = ({ status }) => {
    const { t } = useTranslation();
    if (status === 'used') {
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white">{t('licenses.status_used')}</span>;
    }
    if (status === 'active') {
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">{t('licenses.status_active')}</span>;
    }
    return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive text-destructive-foreground">{t('licenses.status_inactive')}</span>;
};

const Licenses: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<PaginatedResponse<License> | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<{ category: string }>({ category: '' });

    // Filter states
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (statusFilter === 'active') params.append('is_active', 'true');
            if (statusFilter === 'used') params.append('is_used', 'true');
            params.append('page', String(page));

            const [licRes, catRes] = await Promise.all([
                api.get<PaginatedResponse<License>>(`/items/?${params.toString()}`),
                api.get<Category[]>('/categories/')
            ]);
            setData(licRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error(t('licenses.no_data'));
        } finally {
            setLoading(false);
        }
    }, [search, categoryFilter, statusFilter, page, t]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category) return toast.error(t('licenses.select_category'));
        try {
            await api.post('/items/', { category: formData.category });
            toast.success(t('licenses.success_generate'));
            setModalOpen(false);
            setFormData({ category: '' });
            fetchData();
        } catch (error) {
            toast.error('Generation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('licenses.delete_confirm'))) return;
        try {
            await api.delete(`/items/${id}/`);
            toast.success(t('licenses.success_delete'));
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t('licenses.copied'));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">{t('licenses.title')}</h1>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> {t('licenses.generate')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('licenses.search_placeholder')}
                        className="pl-9"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={(v: string) => { setCategoryFilter(v); setPage(1); }}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('licenses.category')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('licenses.all_categories')}</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('licenses.status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('licenses.all_status') || 'All Status'}</SelectItem>
                        <SelectItem value="active">{t('licenses.status_active')}</SelectItem>
                        <SelectItem value="used">{t('licenses.status_used')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('licenses.key')}</TableHead>
                                <TableHead>{t('licenses.category')}</TableHead>
                                <TableHead>{t('licenses.status')}</TableHead>
                                <TableHead>{t('licenses.device_id')}</TableHead>
                                <TableHead className="text-right w-[100px]">{t('licenses.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && !data ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : !data || data.results.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">{t('licenses.no_data')}</TableCell>
                                </TableRow>
                            ) : (
                                data.results.map(lic => (
                                    <TableRow key={lic.id}>
                                        <TableCell className="font-mono text-xs">
                                            <div className="flex items-center gap-2">
                                                {lic.key.substring(0, 8)}...
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(lic.key)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{lic.category_name || '-'}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={lic.is_used ? 'used' : lic.is_active ? 'active' : 'inactive'} />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{lic.device_id || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(lic.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {data && data.count > 0 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        {t('licenses.page')} {page} / {Math.ceil(data.count / 10)} ({data.count} items)
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!data.previous || loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('licenses.prev')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={!data.next || loading}
                        >
                            {t('licenses.next')}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('licenses.generate')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label>{t('licenses.category')}</Label>
                            <Select onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('licenses.select_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>{t('licenses.cancel')}</Button>
                            <Button type="submit">{t('licenses.generate_btn')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Licenses;
