import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <Link href="/">Home</Link> | <Link href="/about">About</Link> | <Link href="/sign-in">Sign In</Link>
    </div>
  );
}
