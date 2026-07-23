import { notFound } from "next/navigation";
import { chapters } from "../chapters";
import { ChapterExperience } from "../chapter-experience";

export function generateStaticParams() {
  return chapters.map(({ slug }) => ({ slug }));
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!chapters.some((chapter) => chapter.slug === slug)) notFound();
  return <ChapterExperience key={slug} slug={slug} />;
}
