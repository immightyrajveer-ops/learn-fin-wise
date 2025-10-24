import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Calendar, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsResponse {
  articles: Article[];
  status: string;
  totalResults: number;
}

type Category = "stocks" | "mutual-funds" | "crypto";

const categoryQueries: Record<Category, string> = {
  stocks: "stock market OR stocks OR equity",
  "mutual-funds": "mutual funds OR investment funds",
  crypto: "cryptocurrency OR bitcoin OR ethereum"
};

const FinanceNews = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>("stocks");
  const { toast } = useToast();

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const fetchNews = async () => {
      if (!apiKey) {
        toast({
          title: "API Key Missing",
          description: "⚠️ Unable to load news. Please add your NewsAPI key in .env file.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const query = categoryQueries[selectedCategory];
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=12&apiKey=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NewsResponse = await response.json();
        
        if (data.status === "ok") {
          setArticles(data.articles);
        } else {
          throw new Error("Failed to fetch news");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast({
          title: "Error Loading News",
          description: "Unable to fetch the latest news. Please try again later.",
          variant: "destructive",
        });
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory, apiKey, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Finance News</h1>
        </div>

        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>
        </Tabs>

        {!apiKey ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">API Key Required</CardTitle>
              <CardDescription>
                ⚠️ Unable to load news. Please add your NewsAPI key in the .env file as VITE_NEWS_API_KEY.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                {article.urlToImage && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{article.source.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(article.url, "_blank")}
                  >
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Articles Found</CardTitle>
              <CardDescription>
                No news articles available for this category at the moment.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FinanceNews;
