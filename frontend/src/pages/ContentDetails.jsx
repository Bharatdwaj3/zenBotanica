import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Leaf, Building2, Hash, Tag, Copy, FileText, Bookmark } from 'lucide-react';
import { getSpecimen, getSimilarSpecimens } from '../util/groveApi';
import { borrowSpecimen as borrowSpecimenRequest } from '../util/tendingApi';
import { toggleBookmark } from '../store/specimenmarkSlice';
import SimilarSpecimensRow from '../components/SimilarSpecimensRow';

const ContentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const specimenmarkedSpecimens = useSelector((state) => state.specimenmark.specimens);
  const { user } = useSelector((state) => state.avatar);
  const isAdmin = user?.role === 'admin';
  const [specimen, setSpecimen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState('');
  const [error, setError] = useState('');
  const [similarByAuthor, setSimilarByAuthor] = useState([]);
  const [similarByGenre, setSimilarByGenre] = useState([]);

  const isBookmarked = specimen ? specimenmarkedSpecimens.some((b) => b.id === specimen.id) : false;

  useEffect(() => {
    const fetchSpecimen = async () => {
      try {
        const { data } = await getSpecimen(id);
        setSpecimen(data);
        getSimilarSpecimens(id).then((res) => {
          setSimilarByAuthor(res.data.byAuthor || []);
          setSimilarByGenre(res.data.byGenre || []);
        }).catch(() => {
          setSimilarByAuthor([]);
          setSimilarByGenre([]);
        });
      } catch {
        setError('Failed to load specimen details');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecimen();
  }, [id]);

  const handleBorrow = async () => {
    setBorrowing(true);
    setBorrowMessage('');
    try {
      await borrowSpecimenRequest({ specimenId: Number(id) });
      setBorrowMessage('Specimen borrowed successfully!');
      const { data } = await getSpecimen(id);
      setSpecimen(data);
    } catch (err) {
      setBorrowMessage(err.response?.data?.message || 'Failed to borrow specimen');
    } finally {
      setBorrowing(false);
    }
  };

  const handleToggleBookmark = () => {
    dispatch(toggleBookmark({ id: specimen.id, title: specimen.title, author: specimen.author, coverUrl: specimen.coverUrl }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !specimen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Specimen not found'}</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Catalog
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
              {specimen.coverUrl ? (
                <img src={specimen.coverUrl} alt={specimen.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf size={64} className="text-foreground/10" />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{specimen.title}</h1>
              <button onClick={handleToggleBookmark} aria-label={isBookmarked ? 'Remove specimenmark' : 'Add specimenmark'} className="shrink-0 p-2 rounded-xl border border-border hover:bg-foreground/5 transition-all">
                <Bookmark size={22} className={isBookmarked ? 'fill-primary text-primary' : 'text-foreground/60'} />
              </button>
            </div>
            <p className="text-xl text-foreground/60 mb-6 font-medium">{specimen.author}</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4 text-foreground/70">
                <div className="flex items-center gap-3"><Building2 size={18} /><span>{specimen.publisher}</span></div>
                <div className="flex items-center gap-3"><Hash size={18} /><span>ISBN: {specimen.isbn}</span></div>
              </div>
              <div className="space-y-4 text-foreground/70">
                <div className="flex items-center gap-3"><Tag size={18} />
                  <div className="flex flex-wrap gap-1">
                    {specimen.genre.map(g => <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{g.replace('_', ' ')}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-3"><Copy size={18} /><span>{specimen.availableCopies} of {specimen.totalCopies} copies available</span></div>
              </div>
            </div>

            {specimen.description && (
              <p className="text-foreground/70 leading-relaxed mb-8">{specimen.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-auto pt-8 border-t border-border">
              {isAdmin ? (
                <button onClick={() => navigate(`/staff/new?edit=${id}`)} className="btn-primary">
                  Edit Specimen
                </button>
              ) : (
                <button onClick={handleBorrow} disabled={borrowing || specimen.availableCopies === 0} className="btn-primary disabled:opacity-50">
                  {borrowing ? 'Borrowing...' : 'Borrow Specimen'}
                </button>
              )}

              {specimen.pdfUrl && (
                <button onClick={() => navigate(`/read/${id}`)} className="btn-outline">
                  <FileText size={20} /> Read Now
                </button>
              )}
            </div>
            {borrowMessage && <p className={`mt-4 text-sm font-medium ${borrowMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{borrowMessage}</p>}
          </div>
        </div>
        <SimilarSpecimensRow title="More by this author" specimens={similarByAuthor} />
        <SimilarSpecimensRow title="More in this genre" specimens={similarByGenre} />
      </div>
    </div>
  );
};

export default ContentDetails;
