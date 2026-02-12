import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Eye,
  Filter,
  IndianRupee,
  MapPin,
  Package,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import type { Listing } from "../../types/listing";
import { normalizeListings } from "../../lib/adapters/listing";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { ContactSellerModal } from "../../components/marketplace/ContactSellerModal";
import { EmptyState, FilterBar, PageHeader, PageShell } from "../../components/layout/PageShell";
import { cn } from "../../lib/cn";

interface PaginatedResponse {
  items: Listing[];
  total: number;
  page: number;
  pages: number;
}

const cropTypes = ["All", "Wheat", "Rice", "Cotton", "Sugarcane", "Potato", "Tomato", "Onion"];
const priceRanges = [
  { label: "All prices", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under ₹50", min: 0, max: 50 },
  { label: "₹50 - ₹100", min: 50, max: 100 },
  { label: "₹100 - ₹200", min: 100, max: 200 },
  { label: "Above ₹200", min: 200, max: Number.POSITIVE_INFINITY },
];

export const MarketplacePage = () => {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; listing: Listing | null }>({
    isOpen: false,
    listing: null,
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse>("/listings", {
        params: {
          page: pagination.page,
          limit: 12,
          status: "active",
        },
      });

      setListings(normalizeListings(response.data.items));
      setPagination({
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
      });
    } catch (error) {
      console.error("Failed to fetch listings", error);
      toast.error("Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        const cropName = listing.cropName.toLowerCase();
        const district = listing.location?.district?.toLowerCase() ?? "";
        const query = searchQuery.toLowerCase();
        const matchesSearch = cropName.includes(query) || district.includes(query);
        const matchesCrop = selectedCrop === "All" || listing.cropName === selectedCrop;
        const matchesPrice =
          listing.pricePerUnit >= selectedPriceRange.min && listing.pricePerUnit <= selectedPriceRange.max;
        return matchesSearch && matchesCrop && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.pricePerUnit - b.pricePerUnit;
        if (sortBy === "price-high") return b.pricePerUnit - a.pricePerUnit;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [listings, searchQuery, selectedCrop, selectedPriceRange, sortBy]);

  return (
    <PageShell>
      <PageHeader
        badge={
          <Badge className="bg-white/20 text-white border-white/35">
            <Sparkles className="h-3.5 w-3.5" />
            {pagination.total} active listings
          </Badge>
        }
        title="Marketplace"
        description="Browse crop offers, compare pricing, and connect directly with farmers and buyers."
        actions={
          user?.role === "farmer" ? (
            <Link to="/marketplace/create">
              <Button>
                <Plus className="h-4 w-4" />
                Create listing
              </Button>
            </Link>
          ) : null
        }
      />

      <section className="mt-6">
        <FilterBar>
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
            <input
              type="text"
              className="field-base pl-10"
              placeholder="Search crop or district"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select className="field-base min-w-40" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
              <option value="newest">Newest first</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>

            <Button variant="secondary" onClick={() => setFiltersOpen((value) => !value)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </FilterBar>

        {filtersOpen ? (
          <Card className="mb-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <p className="mb-2 text-sm font-semibold text-muted">Crop type</p>
                <div className="flex flex-wrap gap-2">
                  {cropTypes.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setSelectedCrop(crop)}
                      className={cn(
                        "rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-semibold transition",
                        selectedCrop === crop
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--surface-muted)] text-muted"
                      )}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-muted">Price range</p>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setSelectedPriceRange(range)}
                      className={cn(
                        "w-full rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm font-semibold transition",
                        selectedPriceRange.label === range.label
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--surface-muted)] text-muted"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-muted">Active filters</p>
                <div className="surface-subtle p-3 text-sm">
                  <p className="text-muted">Crop: {selectedCrop}</p>
                  <p className="text-muted">Price: {selectedPriceRange.label}</p>
                  <Button
                    className="mt-3"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCrop("All");
                      setSelectedPriceRange(priceRanges[0]);
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {!loading ? (
          <p className="mb-4 text-sm text-muted">
            Showing <strong>{filteredListings.length}</strong> of {pagination.total} listings
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="mt-3 h-6 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-4 h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <EmptyState
            title="No listings found"
            description={
              searchQuery
                ? "Try adjusting search and filters to find matching crop listings."
                : "No active listing matches your selected filters yet."
            }
            icon={<Package className="h-6 w-6" />}
            action={
              user?.role === "farmer" ? (
                <Link to="/marketplace/create">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Create your first listing
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing, index) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                viewCount={listing.views ?? 120 + index * 7}
                rating={4.2 + ((index % 5) * 0.1)}
                onContact={() => setContactModal({ isOpen: true, listing })}
              />
            ))}
          </div>
        )}
      </section>

      {contactModal.listing ? (
        <ContactSellerModal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal({ isOpen: false, listing: null })}
          sellerName={contactModal.listing.seller?.name || "Seller"}
          sellerEmail={contactModal.listing.seller?.email || "Not available"}
          cropName={contactModal.listing.cropName}
        />
      ) : null}
    </PageShell>
  );
};

const ListingCard = ({
  listing,
  onContact,
  viewCount,
  rating,
}: {
  listing: Listing;
  onContact: () => void;
  viewCount: number;
  rating: number;
}) => {
  const formattedDate = listing.harvestDate
    ? new Date(listing.harvestDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <Card interactive className="surface-card-hover">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge variant="success">{listing.status || "active"}</Badge>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Listing link copied");
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-soft hover:bg-[var(--surface-muted)]"
          aria-label="Share listing"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{listing.cropName}</h3>
          <div className="flex items-center gap-1 text-sm text-[var(--warning)]">
            <Star className="h-4 w-4 fill-current" />
            {rating.toFixed(1)}
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          {listing.quantity} {listing.unit}
        </p>

        <div className="mt-3 flex items-center gap-1 text-2xl font-bold text-[var(--primary)]">
          <IndianRupee className="h-5 w-5" />
          <span>{listing.pricePerUnit.toLocaleString("en-IN")}</span>
          <span className="text-sm font-semibold text-soft">/ {listing.unit}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {listing.location?.district || "N/A"}, {listing.location?.state || "N/A"}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Harvest date: {formattedDate}
        </p>
        <p className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          {viewCount} views
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <div>
          <p className="text-sm font-semibold">{listing.seller?.name || "Seller"}</p>
          <p className="text-xs text-soft">Verified seller</p>
        </div>
        <Button size="sm" onClick={onContact}>
          Contact
        </Button>
      </div>
    </Card>
  );
};
