"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BLOG_POSTS, BLOG_CATEGORIES, getBlogPostsByCategory } from "@/data/blog"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const filteredPosts = getBlogPostsByCategory(activeCategory)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-coral/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-48 h-48 bg-lavender/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 mb-6">
              <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-foreground">LyricLingo Blog</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Learn, Discover, <span className="text-coral">Grow</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips, insights, and stories about learning languages through music. 
              Discover the science, strategies, and success stories behind musical language learning.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground border border-foreground/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          {activeCategory === "All" && (
            <Link 
              href={`/blog/${BLOG_POSTS[0].slug}`}
              className="block mb-8 sm:mb-12 group"
            >
              <article className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-foreground/10 bg-gradient-to-br from-foreground/5 to-transparent p-6 sm:p-8 md:p-10 hover:border-foreground/20 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-lavender/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2.5 py-1 rounded-full bg-coral/10 text-coral text-xs font-medium">
                        Featured
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-foreground/5 text-muted-foreground text-xs">
                        {BLOG_POSTS[0].category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-coral transition-colors">
                      {BLOG_POSTS[0].title}
                    </h2>
                    
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground line-clamp-3">
                      {BLOG_POSTS[0].excerpt}
                    </p>
                    
                    <div className="mt-4 sm:mt-6 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-lavender flex items-center justify-center text-background text-xs font-bold">
                          {BLOG_POSTS[0].author.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{BLOG_POSTS[0].author.name}</p>
                          <p className="text-xs text-muted-foreground">{BLOG_POSTS[0].author.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(BLOG_POSTS[0].publishedAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {BLOG_POSTS[0].readTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center justify-center w-48 lg:w-64">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-coral/20 to-lavender/20 flex items-center justify-center">
                      <svg className="w-10 h-10 lg:w-12 lg:h-12 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Posts Grid */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.slice(activeCategory === "All" ? 1 : 0).map((post) => (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="h-full flex flex-col rounded-xl sm:rounded-2xl border border-foreground/10 bg-card p-5 sm:p-6 hover:border-foreground/20 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-foreground/5 text-muted-foreground text-[10px] sm:text-xs">
                      {post.category}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-coral transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-foreground/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-coral/50 to-lavender/50 flex items-center justify-center text-background text-[10px] sm:text-xs font-bold">
                        {post.author.avatar}
                      </div>
                      <span className="text-xs sm:text-sm text-foreground">{post.author.name}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">No posts found</h3>
              <p className="mt-2 text-muted-foreground">No articles in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-background to-lavender/20" />
            <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-background/80 backdrop-blur-sm" />
            
            <div className="relative z-10 px-6 sm:px-8 md:px-12 py-10 sm:py-12 md:py-16 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Stay in the Loop
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Get weekly tips on language learning, new song recommendations, and exclusive insights delivered to your inbox.
              </p>
              
              <form className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral/50 text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              
              <p className="mt-4 text-xs text-muted-foreground">
                No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
