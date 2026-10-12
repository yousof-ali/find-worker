import BlogDetails from "@/components/BlogDetails";
import type { Metadata } from "next";


type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${decodeURIComponent(slug.replace(/-/g, " "))} | Blog`,
    description: "Read the latest stories and insights from our community.",
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogDetails slug={slug} />;
}
