import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, User } from '../types';
import { AuctionCard } from './AuctionCard';
import { InlineProductDetails } from './InlineProductDetails';

interface ExpandableProductGridProps {
  products: Product[];
  user: User | null;
  onToggleWatchlist: (productId: number) => void;
  onQuickBuyNow: (product: Product) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onBidSuccess?: () => void;
  gridClassName?: string;
  emptyComponent?: React.ReactNode;
  expandedProductId?: number | null;
  onExpandedChange?: (id: number | null) => void;
}

export const ExpandableProductGrid: React.FC<ExpandableProductGridProps> = ({
  products,
  user,
  onToggleWatchlist,
  onQuickBuyNow,
  onOpenAuth,
  onBidSuccess,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5',
  emptyComponent,
  expandedProductId: controlledExpandedId,
  onExpandedChange
}) => {
  // Support both controlled and uncontrolled expansion state
  const [internalExpandedId, setInternalExpandedId] = useState<number | null>(null);
  const isControlled = controlledExpandedId !== undefined;
  const activeExpandedId = isControlled ? controlledExpandedId : internalExpandedId;

  const setExpandedId = (id: number | null) => {
    if (!isControlled) {
      setInternalExpandedId(id);
    }
    onExpandedChange?.(id);
  };

  const gridRef = useRef<HTMLDivElement>(null);
  const expandedDetailsRef = useRef<HTMLDivElement>(null);
  const [columnsCount, setColumnsCount] = useState<number>(4);

  // Animation state for smooth expanding ("rritje") and shrinking ("zvogëlim")
  const [renderedProduct, setRenderedProduct] = useState<Product | null>(null);
  const [isExpandedVisible, setIsExpandedVisible] = useState<boolean>(false);
  const closeTimerRef = useRef<any>(null);

  useEffect(() => {
    if (activeExpandedId) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      const prod = products.find((p) => p.id === activeExpandedId) || null;
      setRenderedProduct(prod);
      const timer = setTimeout(() => {
        setIsExpandedVisible(true);
      }, 15);
      return () => clearTimeout(timer);
    } else {
      // Trigger smooth shrinking transition
      setIsExpandedVisible(false);
      closeTimerRef.current = setTimeout(() => {
        setRenderedProduct(null);
      }, 300);
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }
  }, [activeExpandedId, products]);

  // Dynamically calculate actual number of columns using ResizeObserver & computed style
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measureColumns = () => {
      try {
        const computed = window.getComputedStyle(el).gridTemplateColumns;
        if (computed) {
          const parts = computed.trim().split(/\s+/).filter(Boolean);
          if (parts.length > 0) {
            setColumnsCount(parts.length);
            return;
          }
        }
      } catch (err) {
        // Fallback below
      }

      const width = el.offsetWidth;
      if (width >= 1024) setColumnsCount(4);
      else if (width >= 768) setColumnsCount(3);
      else setColumnsCount(2); // Mobile defaults to 2 columns so at least 4 items are in the grid!
    };

    measureColumns();
    const observer = new ResizeObserver(measureColumns);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // When expanding a product, scroll smoothly into view if partially off-screen without losing position
  useEffect(() => {
    if (activeExpandedId && isExpandedVisible && expandedDetailsRef.current) {
      const rect = expandedDetailsRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 80 && rect.bottom <= window.innerHeight;
      if (!isVisible) {
        expandedDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeExpandedId, isExpandedVisible]);

  // Calculate the index after which the expanded view must be placed
  const { expandedIndex, rowEndIndex } = useMemo(() => {
    if (!renderedProduct) return { expandedIndex: -1, rowEndIndex: -1 };
    const idx = products.findIndex((p) => p.id === renderedProduct.id);
    if (idx === -1) return { expandedIndex: -1, rowEndIndex: -1 };

    const cols = Math.max(1, columnsCount);
    const row = Math.floor(idx / cols);
    const end = Math.min(products.length - 1, row * cols + (cols - 1));

    return { expandedIndex: idx, rowEndIndex: end };
  }, [products, renderedProduct, columnsCount]);

  const handleToggleProduct = (product: Product) => {
    if (activeExpandedId === product.id) {
      setExpandedId(null);
    } else {
      setExpandedId(product.id);
    }
  };

  if (products.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div ref={gridRef} className={gridClassName}>
      {products.map((product, index) => {
        const isCurrentExpanded = product.id === activeExpandedId;
        const shouldRenderExpandedAfterThis = index === rowEndIndex && renderedProduct !== null;

        return (
          <React.Fragment key={product.id}>
            <AuctionCard
              product={product}
              isExpanded={isCurrentExpanded}
              onSelect={handleToggleProduct}
              onToggleWatchlist={onToggleWatchlist}
              onQuickBuyNow={onQuickBuyNow}
            />

            {/* Inline Expanded Product Details Component with Smooth Expand & Shrink Transitions */}
            {shouldRenderExpandedAfterThis && (
              <div 
                ref={expandedDetailsRef}
                className={`col-span-full w-full transition-all duration-300 ease-in-out transform origin-top ${
                  isExpandedVisible 
                    ? 'opacity-100 max-h-[3500px] scale-100 py-2' 
                    : 'opacity-0 max-h-0 scale-98 py-0 overflow-hidden pointer-events-none'
                }`}
                style={{ gridColumn: '1 / -1' }}
              >
                <InlineProductDetails
                  product={renderedProduct}
                  user={user}
                  onClose={() => setExpandedId(null)}
                  onOpenAuth={onOpenAuth}
                  onBuyNowClick={onQuickBuyNow}
                  onBidSuccess={onBidSuccess}
                  onToggleWatchlist={onToggleWatchlist}
                  onSelectProduct={(p) => setExpandedId(p.id)}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
