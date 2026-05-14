import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

// https://localhost:3000/about
export default function AboutPage() {
  return (
    <div>
      <p className="text-sky-500">About Us</p>
      <p className="text-gray-500">API Key: {process.env.API_KEY}</p>
      <Spinner className="w-6 h-6" />
      <Button variant="link"><Link href="/">Home</Link></Button>
      
    </div>
  );
}