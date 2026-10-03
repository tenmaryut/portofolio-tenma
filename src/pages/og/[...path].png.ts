import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { ogEntries } from '../../data/pages';
import { renderOgImage } from '../../lib/og';

export const getStaticPaths = (() =>
  ogEntries().map((entry) => ({ params: { path: entry.path }, props: { entry } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = await renderOgImage(props.entry);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
