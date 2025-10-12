import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Video {
  id: string;
  title: string;
  youtube_url: string;
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
}

const Module = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchModuleData = async () => {
      if (!moduleId) return;

      const { data: moduleData } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .eq("module_id", moduleId)
        .order("created_at");

      if (moduleData) setModule(moduleData);
      if (videosData) setVideos(videosData);
    };

    fetchModuleData();
  }, [moduleId]);

  if (!module) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{module.title}</h1>
            <p className="text-lg text-muted-foreground">{module.description}</p>
          </div>

          <Separator className="mb-8" />

          <div className="space-y-8">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full">
                    <iframe
                      src={video.youtube_url}
                      title={video.title}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Module;
