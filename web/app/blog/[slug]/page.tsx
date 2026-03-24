import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BLOG_POSTS, getBlogPost, getRelatedPosts } from "@/data/blog"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  
  if (!post) {
    return {
      title: "Post Not Found - LyricLingo Blog",
    }
  }

  return {
    title: `${post.title} - LyricLingo Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug, 3)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Article Header */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-coral/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-48 h-48 bg-lavender/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <span className="text-muted-foreground">{post.category}</span>
              </li>
            </ol>
          </nav>

          {/* Category & Read Time */}
          <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-6">
            <span className="px-3 py-1 rounded-full bg-coral/10 text-coral text-xs sm:text-sm font-medium">
              {post.category}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">
            {post.excerpt}
          </p>

          {/* Author & Date */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-coral to-lavender flex items-center justify-center text-background font-bold">
                {post.author.avatar}
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-foreground">{post.author.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{post.author.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.publishedAt)}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none
            prose-headings:text-foreground prose-headings:font-semibold
            prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 sm:prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 sm:prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-coral prose-a:no-underline hover:prose-a:underline
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-li:marker:text-coral
            prose-blockquote:border-l-coral prose-blockquote:text-muted-foreground prose-blockquote:italic
          ">
            {post.content.split('\n').map((paragraph, index) => {
              const trimmed = paragraph.trim()
              if (!trimmed) return null
              
              if (trimmed.startsWith('## ')) {
                return <h2 key={index}>{trimmed.replace('## ', '')}</h2>
              }
              if (trimmed.startsWith('### ')) {
                return <h3 key={index}>{trimmed.replace('### ', '')}</h3>
              }
              if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <p key={index}><strong>{trimmed.slice(2, -2)}</strong></p>
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return null // Will be handled by list grouping
              }
              if (/^\d+\.\s/.test(trimmed)) {
                return null // Will be handled by list grouping
              }
              
              return <p key={index}>{trimmed}</p>
            })}
          </article>

          {/* Tags */}
          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-foreground/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Tags:</span>
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 rounded-full bg-foreground/5 text-foreground/70 text-xs sm:text-sm hover:bg-foreground/10 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-foreground/5 border border-foreground/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Enjoyed this article?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Share it with fellow language learners!</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 sm:p-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors text-muted-foreground hover:text-foreground">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button className="p-2 sm:p-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors text-muted-foreground hover:text-foreground">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button className="p-2 sm:p-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors text-muted-foreground hover:text-foreground">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 border-t border-foreground/5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">
              Related Articles
            </h2>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="h-full flex flex-col rounded-xl sm:rounded-2xl border border-foreground/10 bg-card p-5 sm:p-6 hover:border-foreground/20 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground text-xs">
                        {relatedPost.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {relatedPost.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-coral transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral/50 to-lavender/50 flex items-center justify-center text-background text-xs font-bold">
                        {relatedPost.author.avatar}
                      </div>
                      <span className="text-xs text-foreground">{relatedPost.author.name}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog CTA */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all articles
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
