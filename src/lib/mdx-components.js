// Components available inside every .mdx post and project page (no imports needed in the files).
import { YouTube } from "@astro-community/astro-embed-youtube";
import { Tweet } from "@astro-community/astro-embed-twitter";
import Img from "../components/Img.astro";
import Gallery from "../components/Gallery.astro";
import Callout from "../components/Callout.astro";
import Figma from "../components/Figma.astro";
import LinkCard from "../components/LinkCard.astro";
import A from "../components/A.astro";

export const mdxComponents = { a: A, Img, Gallery, Callout, Figma, LinkCard, YouTube, Tweet };
