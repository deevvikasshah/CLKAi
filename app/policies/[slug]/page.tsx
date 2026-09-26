import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.contentPage.findUnique({ where: { slug: params.slug } });
  return { title: page?.title ?? "Policy not found" };
}

export default async function PolicyPage({ params }: { params: { slug: string } }) {
  const page = await prisma.contentPage.findUnique({ where: { slug: params.slug } });
  if (!page || page.status !== "published") notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">{page.title}</h1>

      {page.needsLegalReview && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          This policy is a draft and has not yet been reviewed by a qualified legal professional. It may
          change before CLKAi&rsquo;s public launch.
        </div>
      )}

      <div className="mt-6 whitespace-pre-line text-sm text-ink-700">{page.bodyMarkdown}</div>

      <p className="mt-8 text-xs text-ink-500">Last updated {page.updatedAt.toLocaleDateString("en-IN")}</p>
    </div>
  );
}
