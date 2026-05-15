import Link from "next/link";
import { CourseResponse } from "@/types/course";

async function fetchCourses(): Promise<CourseResponse> {
  const res = await fetch("https://api.codingthailand.com/api/course");
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  const json: unknown = await res.json();
  return json as CourseResponse;
}

const CourseFeatures = async () => {
    const courses = await fetchCourses();
    console.log(courses);
    
  return (
    <div className="px-6 py-20">
      <div className="mx-auto w-full max-w-(--breakpoint-xl)">
        <h2 className="text-pretty font-medium text-4xl tracking-[-0.04em] sm:mx-auto sm:max-w-xl sm:text-center md:text-[2.75rem] md:leading-[1.2]">
          Courses
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground text-xl -tracking-[0.01em] sm:text-center md:text-2xl">
          No complex lessons. Just learn, practice, and start building
        </p>
        <div className="mt-12 grid gap-6 sm:mt-18 sm:gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.data.map((course, index) => (
            <Link href="#" key={index}>
              <div className="-mx-2 flex max-w-lg items-center gap-6 rounded-lg sm:mx-0">
                <div className="aspect-square h-24 shrink-0 overflow-hidden rounded-lg bg-background">
                  <img
                    alt=""
                    className="size-full object-contain"
                    height={96}
                    src={course.picture}
                    width={96}
                  />
                </div>
                <div className="">
                  <span className="font-medium text-lg tracking-[-0.015em]">
                    {course.title}
                  </span>
                  <p className="mt-1 text-pretty text-muted-foreground">
                    {course.detail}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseFeatures;
