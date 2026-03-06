// src/components/Categories.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronUp
} from 'lucide-react';
import { mainCategories, moreCategories } from '@/data/categories';

const Categories = () => {
  const [showAll, setShowAll] = useState(false);

  const allCategories = showAll ? [...mainCategories, ...moreCategories] : mainCategories;

  return (
    <section className="py-16 store-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground mt-2 text-lg">Everything you need, organized and easy to find</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allCategories.map((cat, i) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group bg-card rounded-2xl p-5 store-shadow hover:store-shadow-hover transition-all duration-300 hover:-translate-y-1 text-left animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors store-shadow"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>View All Categories ({mainCategories.length + moreCategories.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;