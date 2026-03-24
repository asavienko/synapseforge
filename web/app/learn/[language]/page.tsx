import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LANGUAGES, TOPICS, GENRES } from "@/lib/constants"

interface LanguagePageProps {
  params: Promise<{ language: string }>
}

const languageData: Record<string, {
  name: string
  flag: string
  nativeName: string
  description: string
  speakers: string
  difficulty: string
  difficultyColor: string
  funFacts: string[]
  sampleWords: { word: string; translation: string; pronunciation: string }[]
  popularTopics: string[]
}> = {
  spanish: {
    name: "Spanish",
    flag: "🇪🇸",
    nativeName: "Español",
    description: "Spanish is one of the most widely spoken languages in the world, with over 500 million native speakers across 20+ countries. Its musical rhythm and clear pronunciation make it ideal for learning through songs.",
    speakers: "500M+ native speakers",
    difficulty: "Easy",
    difficultyColor: "mint",
    funFacts: [
      "Spanish is the official language of 20 countries",
      "It's the second most spoken native language after Mandarin",
      "Spanish shares 75% vocabulary similarity with Portuguese",
      "There are more Spanish speakers in the US than in Spain",
    ],
    sampleWords: [
      { word: "amor", translation: "love", pronunciation: "ah-MOR" },
      { word: "música", translation: "music", pronunciation: "MOO-see-kah" },
      { word: "cantar", translation: "to sing", pronunciation: "kahn-TAR" },
      { word: "corazón", translation: "heart", pronunciation: "koh-rah-SOHN" },
      { word: "bailar", translation: "to dance", pronunciation: "bai-LAR" },
    ],
    popularTopics: ["Travel", "Romance", "Food", "Daily Life"],
  },
  french: {
    name: "French",
    flag: "🇫🇷",
    nativeName: "Français",
    description: "French is known as the language of love and diplomacy. Its melodic quality and elegant phrasing make it perfectly suited for musical learning. French music spans from classic chansons to modern pop.",
    speakers: "280M+ speakers worldwide",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "French is an official language in 29 countries",
      "It's the most studied language after English",
      "French contributed over 10,000 words to English",
      "It's one of the six official UN languages",
    ],
    sampleWords: [
      { word: "amour", translation: "love", pronunciation: "ah-MOOR" },
      { word: "chanson", translation: "song", pronunciation: "shahn-SOHN" },
      { word: "rêve", translation: "dream", pronunciation: "rev" },
      { word: "lumière", translation: "light", pronunciation: "loo-MYEHR" },
      { word: "étoile", translation: "star", pronunciation: "ay-TWAL" },
    ],
    popularTopics: ["Romance", "Food", "Travel", "Art"],
  },
  german: {
    name: "German",
    flag: "🇩🇪",
    nativeName: "Deutsch",
    description: "German is the most widely spoken native language in the European Union. Its logical structure and compound words create interesting lyrical possibilities in songs.",
    speakers: "100M+ native speakers",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "German has three grammatical genders",
      "It's known for creating long compound words",
      "German is the language of classical music composers",
      "It shares roots with English as a Germanic language",
    ],
    sampleWords: [
      { word: "Liebe", translation: "love", pronunciation: "LEE-buh" },
      { word: "Musik", translation: "music", pronunciation: "moo-ZEEK" },
      { word: "Traum", translation: "dream", pronunciation: "TROWM" },
      { word: "Herz", translation: "heart", pronunciation: "HERTS" },
      { word: "Freude", translation: "joy", pronunciation: "FROY-duh" },
    ],
    popularTopics: ["Business", "Technology", "Travel", "Nature"],
  },
  japanese: {
    name: "Japanese",
    flag: "🇯🇵",
    nativeName: "日本語",
    description: "Japanese offers a unique linguistic experience with its three writing systems and honorific speech. J-Pop and anime music provide engaging material for learning this fascinating language.",
    speakers: "125M+ native speakers",
    difficulty: "Hard",
    difficultyColor: "coral",
    funFacts: [
      "Japanese uses three writing systems: Hiragana, Katakana, and Kanji",
      "It has no grammatical gender or plural forms",
      "Politeness levels change entire verb conjugations",
      "Anime and manga have popularized Japanese worldwide",
    ],
    sampleWords: [
      { word: "愛 (ai)", translation: "love", pronunciation: "ah-ee" },
      { word: "音楽 (ongaku)", translation: "music", pronunciation: "on-GAH-koo" },
      { word: "夢 (yume)", translation: "dream", pronunciation: "yoo-meh" },
      { word: "心 (kokoro)", translation: "heart", pronunciation: "koh-koh-roh" },
      { word: "歌 (uta)", translation: "song", pronunciation: "oo-tah" },
    ],
    popularTopics: ["Anime", "Daily Life", "Travel", "Nature"],
  },
  korean: {
    name: "Korean",
    flag: "🇰🇷",
    nativeName: "한국어",
    description: "Korean features the ingenious Hangul alphabet and a rich musical tradition. K-Pop has made Korean one of the most popular languages to learn, and our songs tap into that cultural excitement.",
    speakers: "80M+ native speakers",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "Hangul was scientifically designed and can be learned in hours",
      "Korean has no grammatical gender",
      "K-Pop has driven massive growth in Korean language learning",
      "Korean honorifics reflect social relationships",
    ],
    sampleWords: [
      { word: "사랑 (sarang)", translation: "love", pronunciation: "sah-RAHNG" },
      { word: "음악 (eumak)", translation: "music", pronunciation: "eu-MAHK" },
      { word: "꿈 (kkum)", translation: "dream", pronunciation: "kkoom" },
      { word: "마음 (maeum)", translation: "heart/mind", pronunciation: "mah-EUM" },
      { word: "노래 (norae)", translation: "song", pronunciation: "noh-RAE" },
    ],
    popularTopics: ["K-Pop", "Romance", "Daily Life", "Food"],
  },
  mandarin: {
    name: "Mandarin",
    flag: "🇨🇳",
    nativeName: "中文",
    description: "Mandarin Chinese is the world's most spoken native language. Its tonal nature makes it naturally musical, and learning through songs helps master those crucial tones.",
    speakers: "920M+ native speakers",
    difficulty: "Hard",
    difficultyColor: "coral",
    funFacts: [
      "Mandarin has four tones that change word meanings",
      "Chinese characters represent meanings, not sounds",
      "There are over 50,000 Chinese characters",
      "Mandarin grammar has no verb conjugations",
    ],
    sampleWords: [
      { word: "爱 (ài)", translation: "love", pronunciation: "eye (falling tone)" },
      { word: "音乐 (yīnyuè)", translation: "music", pronunciation: "yin-yoo-eh" },
      { word: "梦 (mèng)", translation: "dream", pronunciation: "muhng" },
      { word: "心 (xīn)", translation: "heart", pronunciation: "sheen" },
      { word: "歌 (gē)", translation: "song", pronunciation: "guh" },
    ],
    popularTopics: ["Business", "Travel", "Food", "Technology"],
  },
  italian: {
    name: "Italian",
    flag: "🇮🇹",
    nativeName: "Italiano",
    description: "Italian is the language of music itself—many musical terms come from Italian. Its vowel-rich pronunciation and romantic flow make it a joy to sing and learn.",
    speakers: "65M+ native speakers",
    difficulty: "Easy",
    difficultyColor: "mint",
    funFacts: [
      "Most musical terms worldwide are Italian",
      "Italian is closest to Latin among Romance languages",
      "Opera was born in Italy",
      "Italian has the clearest pronunciation of Romance languages",
    ],
    sampleWords: [
      { word: "amore", translation: "love", pronunciation: "ah-MOH-reh" },
      { word: "musica", translation: "music", pronunciation: "MOO-zee-kah" },
      { word: "sogno", translation: "dream", pronunciation: "SOHN-yoh" },
      { word: "cuore", translation: "heart", pronunciation: "KWOH-reh" },
      { word: "cantare", translation: "to sing", pronunciation: "kahn-TAH-reh" },
    ],
    popularTopics: ["Food", "Romance", "Art", "Travel"],
  },
  portuguese: {
    name: "Portuguese",
    flag: "🇧🇷",
    nativeName: "Português",
    description: "Portuguese has a beautiful, flowing rhythm influenced by its Brazilian and European variants. From bossa nova to modern pop, Portuguese music provides rich material for language learning.",
    speakers: "260M+ speakers worldwide",
    difficulty: "Easy",
    difficultyColor: "mint",
    funFacts: [
      "Portuguese is spoken on every continent",
      "Brazilian Portuguese has distinct rhythm and vocabulary",
      "It's the most spoken language in South America",
      "Portuguese shares 89% lexical similarity with Spanish",
    ],
    sampleWords: [
      { word: "amor", translation: "love", pronunciation: "ah-MOR" },
      { word: "música", translation: "music", pronunciation: "MOO-zee-kah" },
      { word: "sonho", translation: "dream", pronunciation: "SOHN-yoo" },
      { word: "coração", translation: "heart", pronunciation: "koh-rah-SOWN" },
      { word: "cantar", translation: "to sing", pronunciation: "kahn-TAR" },
    ],
    popularTopics: ["Travel", "Romance", "Nature", "Food"],
  },
  swahili: {
    name: "Swahili",
    flag: "🇰🇪",
    nativeName: "Kiswahili",
    description: "Swahili is a Bantu language spoken across East Africa, known for its rhythmic beauty and musical traditions. It's one of Africa's most widely spoken languages and serves as a lingua franca for over 100 million people.",
    speakers: "100M+ speakers worldwide",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "Swahili is spoken in over 12 African countries",
      "The word 'safari' comes from Swahili meaning 'journey'",
      "Swahili has borrowed words from Arabic, Portuguese, and English",
      "It's one of the easiest African languages for English speakers",
    ],
    sampleWords: [
      { word: "upendo", translation: "love", pronunciation: "oo-PEN-doh" },
      { word: "muziki", translation: "music", pronunciation: "moo-ZEE-kee" },
      { word: "ndoto", translation: "dream", pronunciation: "n-DOH-toh" },
      { word: "moyo", translation: "heart", pronunciation: "MOH-yoh" },
      { word: "kuimba", translation: "to sing", pronunciation: "koo-EEM-bah" },
    ],
    popularTopics: ["Travel", "Nature", "Daily Life", "Culture"],
  },
  arabic: {
    name: "Arabic",
    flag: "🇸🇦",
    nativeName: "العربية",
    description: "Arabic is one of the world's oldest and most beautiful languages, spoken by over 400 million people. Its poetic tradition and musical heritage make it perfect for learning through songs.",
    speakers: "400M+ speakers worldwide",
    difficulty: "Hard",
    difficultyColor: "coral",
    funFacts: [
      "Arabic is written from right to left",
      "It's one of the six official UN languages",
      "Many English words come from Arabic like 'coffee' and 'algebra'",
      "Arabic has influenced Spanish, Portuguese, and Swahili",
    ],
    sampleWords: [
      { word: "حب (hubb)", translation: "love", pronunciation: "hoob" },
      { word: "موسيقى (musiqa)", translation: "music", pronunciation: "moo-SEE-qa" },
      { word: "حلم (hulm)", translation: "dream", pronunciation: "hoolm" },
      { word: "قلب (qalb)", translation: "heart", pronunciation: "qalb" },
      { word: "غناء (ghina)", translation: "singing", pronunciation: "ghee-NAA" },
    ],
    popularTopics: ["Culture", "Travel", "Romance", "Daily Life"],
  },
  hindi: {
    name: "Hindi",
    flag: "🇮🇳",
    nativeName: "हिन्दी",
    description: "Hindi is one of the most spoken languages in the world, famous for its Bollywood music tradition. The melodic nature of Hindi makes it ideal for musical language learning.",
    speakers: "600M+ speakers worldwide",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "Hindi and English are both official languages of India",
      "Bollywood produces more films than Hollywood",
      "Hindi uses the Devanagari script",
      "Many English words come from Hindi like 'jungle' and 'karma'",
    ],
    sampleWords: [
      { word: "प्यार (pyaar)", translation: "love", pronunciation: "pyaar" },
      { word: "संगीत (sangeet)", translation: "music", pronunciation: "san-GEET" },
      { word: "सपना (sapna)", translation: "dream", pronunciation: "SAP-na" },
      { word: "दिल (dil)", translation: "heart", pronunciation: "dil" },
      { word: "गाना (gaana)", translation: "song", pronunciation: "GAA-na" },
    ],
    popularTopics: ["Bollywood", "Romance", "Daily Life", "Travel"],
  },
  russian: {
    name: "Russian",
    flag: "🇷🇺",
    nativeName: "Русский",
    description: "Russian is the largest native language in Europe, known for its rich literary and musical traditions. From folk songs to modern pop, Russian offers diverse musical material for learning.",
    speakers: "250M+ speakers worldwide",
    difficulty: "Hard",
    difficultyColor: "coral",
    funFacts: [
      "Russian uses the Cyrillic alphabet with 33 letters",
      "It's an official language in 4 countries",
      "Russian literature is world-renowned",
      "There's no word for 'the' or 'a' in Russian",
    ],
    sampleWords: [
      { word: "любовь (lyubov)", translation: "love", pronunciation: "lyoo-BOFF" },
      { word: "музыка (muzyka)", translation: "music", pronunciation: "MOO-zi-ka" },
      { word: "мечта (mechta)", translation: "dream", pronunciation: "mech-TAH" },
      { word: "сердце (serdtse)", translation: "heart", pronunciation: "SERD-tse" },
      { word: "петь (pet)", translation: "to sing", pronunciation: "pyet" },
    ],
    popularTopics: ["Culture", "Nature", "Daily Life", "Romance"],
  },
  dutch: {
    name: "Dutch",
    flag: "🇳🇱",
    nativeName: "Nederlands",
    description: "Dutch is a West Germanic language closely related to English and German. Its straightforward grammar and pronunciation make it accessible for English speakers learning through music.",
    speakers: "25M+ native speakers",
    difficulty: "Easy",
    difficultyColor: "mint",
    funFacts: [
      "Dutch is the closest major language to English",
      "It's spoken in the Netherlands, Belgium, and Suriname",
      "Many English nautical terms come from Dutch",
      "Dutch uses many compound words like German",
    ],
    sampleWords: [
      { word: "liefde", translation: "love", pronunciation: "LEEF-duh" },
      { word: "muziek", translation: "music", pronunciation: "moo-ZEEK" },
      { word: "droom", translation: "dream", pronunciation: "drohm" },
      { word: "hart", translation: "heart", pronunciation: "hart" },
      { word: "zingen", translation: "to sing", pronunciation: "ZING-en" },
    ],
    popularTopics: ["Travel", "Daily Life", "Business", "Nature"],
  },
  turkish: {
    name: "Turkish",
    flag: "🇹🇷",
    nativeName: "Türkçe",
    description: "Turkish is an agglutinative language with a rich musical heritage spanning from traditional folk to modern pop. Its logical grammar system and phonetic spelling make it rewarding to learn.",
    speakers: "80M+ native speakers",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "Turkish uses vowel harmony throughout words",
      "It's written with a modified Latin alphabet",
      "Turkish has no grammatical gender",
      "Words are built by adding suffixes to roots",
    ],
    sampleWords: [
      { word: "aşk", translation: "love", pronunciation: "ahshk" },
      { word: "müzik", translation: "music", pronunciation: "moo-ZEEK" },
      { word: "rüya", translation: "dream", pronunciation: "ROO-ya" },
      { word: "kalp", translation: "heart", pronunciation: "kalp" },
      { word: "şarkı", translation: "song", pronunciation: "shar-KUH" },
    ],
    popularTopics: ["Romance", "Travel", "Food", "Culture"],
  },
  greek: {
    name: "Greek",
    flag: "🇬🇷",
    nativeName: "Ελληνικά",
    description: "Greek is one of the world's oldest recorded languages with a 3,400-year history. Its musical traditions from rebetiko to laiko provide authentic material for language learning.",
    speakers: "13M+ native speakers",
    difficulty: "Medium",
    difficultyColor: "lavender",
    funFacts: [
      "Greek alphabet has been used for 2,800 years",
      "Many English words have Greek roots",
      "Greek was the language of the New Testament",
      "It has three grammatical genders",
    ],
    sampleWords: [
      { word: "αγάπη (agapi)", translation: "love", pronunciation: "ah-GAH-pee" },
      { word: "μουσική (mousiki)", translation: "music", pronunciation: "moo-see-KEE" },
      { word: "όνειρο (oneiro)", translation: "dream", pronunciation: "OH-nee-roh" },
      { word: "καρδιά (kardia)", translation: "heart", pronunciation: "kar-DYAH" },
      { word: "τραγούδι (tragoudi)", translation: "song", pronunciation: "tra-GHOO-dee" },
    ],
    popularTopics: ["Culture", "Travel", "Food", "Romance"],
  },
}

export async function generateStaticParams() {
  return Object.keys(languageData).map((language) => ({
    language,
  }))
}

export async function generateMetadata({ params }: LanguagePageProps): Promise<Metadata> {
  const { language } = await params
  const data = languageData[language]
  
  if (!data) {
    return { title: "Language Not Found" }
  }

  return {
    title: `Learn ${data.name} Through Music - LyricLingo`,
    description: `Master ${data.name} vocabulary with AI-generated songs. Learn ${data.name} the fun way with personalized music in your favorite genres. ${data.speakers}.`,
    openGraph: {
      title: `Learn ${data.name} with Music | LyricLingo`,
      description: `${data.description.slice(0, 150)}...`,
    },
  }
}

export default async function LanguagePage({ params }: LanguagePageProps) {
  const { language } = await params
  const data = languageData[language]

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-coral/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <span className="text-6xl sm:text-7xl md:text-8xl mb-6 block">{data.flag}</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Learn {data.name}
                <span className="block text-coral mt-1">Through Music</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {data.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <span className="px-4 py-2 rounded-full bg-secondary text-sm">
                  {data.speakers}
                </span>
                <span className={`px-4 py-2 rounded-full bg-${data.difficultyColor}/10 text-${data.difficultyColor} text-sm`}>
                  Difficulty: {data.difficulty}
                </span>
              </div>
              <div className="mt-8">
                <Link
                  href={`/get-started?language=${language}`}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
                >
                  Start Learning {data.name}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Words */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Sample {data.name} Words You'll Learn
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              These are just a few examples. Our AI creates personalized songs with any vocabulary you choose.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sampleWords.map((word) => (
                <div
                  key={word.word}
                  className="p-6 rounded-2xl bg-card border border-border/50 text-center"
                >
                  <div className="text-2xl font-bold text-foreground mb-2">{word.word}</div>
                  <div className="text-coral font-medium mb-1">{word.translation}</div>
                  <div className="text-sm text-muted-foreground">{word.pronunciation}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Popular {data.name} Topics
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {data.popularTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/topics/${topic.toLowerCase()}`}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-coral/30 transition-colors group"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-coral transition-colors">
                    {data.name} {topic} Vocabulary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn essential {topic.toLowerCase()} words and phrases in {data.name} through custom songs.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Fun Facts */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Fun Facts About {data.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.funFacts.map((fact, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card border border-border/50 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Music Genres */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Choose Your {data.name} Music Style
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Learn in the genre you enjoy most. Our AI generates authentic {data.name} songs in any style.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {GENRES.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.id}`}
                  className="px-6 py-3 rounded-full bg-card border border-border/50 hover:border-coral/30 hover:bg-coral/5 transition-colors"
                >
                  {genre.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other Languages */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Explore Other Languages
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(languageData)
                .filter(([key]) => key !== language)
                .slice(0, 6)
                .map(([key, lang]) => (
                  <Link
                    key={key}
                    href={`/learn/${key}`}
                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border/50 hover:border-lavender/30 transition-colors"
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </Link>
                ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/learn" className="text-coral hover:underline">
                View all 100+ languages →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Learn {data.name}?
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your first {data.name} song in under a minute. Start for free.
            </p>
            <Link
              href={`/get-started?language=${language}`}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
            >
              Start Learning {data.name} Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
