import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, ShieldAlert } from 'lucide-react';
import { addBook, updateBook, getBook, uploadFile, extractPdf } from '../util/catalogApi';

const GENRES = [
  'FICTION', 'NON_FICTION', 'FANTASY', 'SCIENCE', 'SCIENCE_FICTION',
  'MYSTERY', 'ROMANCE', 'HORROR', 'HISTORY', 'BIOGRAPHY',
  'POETRY', 'DRAMA', 'SELF_HELP', 'TECHNOLOGY', 'PHILOSOPHY', 'CHILDREN',
];

export default function NewStory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = Boolean(editId);
  const { user } = useSelector((state) => state.avatar);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    genre: [],
    totalCopies: 1,
    availableCopies: 1,
    description: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [suggestedCoverUrl, setSuggestedCoverUrl] = useState(null);
  const [useSuggestedCover, setUseSuggestedCover] = useState(false);

  // Edit mode: load the existing book once and prefill the form.
  useEffect(() => {
    if (!isEditing) return;
    const loadBook = async () => {
      try {
        const { data } = await getBook(editId);
        setForm({
          title: data.title || '',
          author: data.author || '',
          publisher: data.publisher || '',
          isbn: data.isbn || '',
          genre: data.genre || [],
          totalCopies: data.totalCopies ?? 1,
          availableCopies: data.availableCopies ?? 1,
          description: data.description || '',
        });
        setExistingCoverUrl(data.coverUrl || '');
        setExistingPdfUrl(data.pdfUrl || '');
      } catch {
        setError('Could not load this book for editing');
      } finally {
        setLoadingExisting(false);
      }
    };
    loadBook();
  }, [editId, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleGenre = (g) => {
    setForm((prev) => ({
      ...prev,
      genre: prev.genre.includes(g)
        ? prev.genre.filter((x) => x !== g)
        : [...prev.genre, g],
    }));
  };

  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setExtracting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await extractPdf(formData);
      setForm((prev) => ({
        ...prev,
        title: prev.title || data.title || '',
        author: prev.author || data.author || '',
      }));
      if (data.suggestedCoverUrl) {
        setSuggestedCoverUrl(data.suggestedCoverUrl);
        setUseSuggestedCover(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to read PDF');
    } finally {
      setExtracting(false);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setUseSuggestedCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim()) {
      setError('Title, author, and ISBN are required');
      return;
    }
    setSaving(true);
    try {
      let coverUrl = useSuggestedCover ? suggestedCoverUrl : existingCoverUrl;
      if (coverFile && !useSuggestedCover) {
        const fd = new FormData();
        fd.append('file', coverFile);
        const { data } = await uploadFile(fd);
        coverUrl = data.url;
      }

      let pdfUrl = existingPdfUrl;
      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        const { data } = await uploadFile(fd);
        pdfUrl = data.url;
      }

      const payload = {
        ...form,
        totalCopies: Number(form.totalCopies),
        availableCopies: Number(form.availableCopies),
        coverUrl,
        pdfUrl,
      };

      if (isEditing) {
        await updateBook(editId, payload);
        navigate(`/content/${editId}`);
      } else {
        await addBook(payload);
        navigate('/content');
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} book`);
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <ShieldAlert size={48} className="text-foreground/20 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Admins Only</h1>
          <p className="text-foreground/50 text-sm">Only admins can add new books to the catalog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-foreground/5 rounded-lg transition-colors border border-border"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-3xl tracking-wide">{isEditing ? 'Edit Book' : 'Add a Book'}</h1>
          </motion.div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Author</label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Publisher</label>
                <input
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-foreground/70 mb-1">ISBN</label>
                <input
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Total Copies</label>
                <input
                  type="number"
                  name="totalCopies"
                  min="1"
                  value={form.totalCopies}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Available</label>
                <input
                  type="number"
                  name="availableCopies"
                  min="0"
                  value={form.availableCopies}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Description (optional)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="A short summary readers will see on the book's page..."
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Book PDF (optional)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="w-full text-sm text-foreground/70 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold file:cursor-pointer cursor-pointer"
              />
              {existingPdfUrl && !pdfFile && (
                <p className="text-xs text-foreground/50 mt-1.5">Keeping the existing PDF unless you upload a new one.</p>
              )}
              {extracting && (
                <p className="text-xs text-foreground/50 mt-1.5 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Reading title, author, and cover from PDF...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">Cover Image (optional)</label>
              {existingCoverUrl && !coverFile && !useSuggestedCover && (
                <div className="mb-2 flex items-center gap-3">
                  <img
                    src={existingCoverUrl}
                    alt="Current cover"
                    className="h-20 w-14 object-cover rounded-lg border border-border"
                  />
                  <p className="text-xs text-foreground/50">Keeping the existing cover unless you upload a new one.</p>
                </div>
              )}
              {suggestedCoverUrl && (
                <div className="mb-2 flex items-center gap-3">
                  <img
                    src={suggestedCoverUrl}
                    alt="Suggested cover from PDF"
                    className="h-20 w-14 object-cover rounded-lg border border-border"
                  />
                  <label className="flex items-center gap-2 text-xs text-foreground/70">
                    <input
                      type="checkbox"
                      checked={useSuggestedCover}
                      onChange={(e) => setUseSuggestedCover(e.target.checked)}
                    />
                    Use this cover from the PDF
                  </label>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full text-sm text-foreground/70 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold file:cursor-pointer cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">Genres</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      form.genre.includes(g)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card border-border text-foreground/60 hover:border-primary'
                    }`}
                  >
                    {g.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full justify-center btn-primary disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Book')}
              {!saving && <Save className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
