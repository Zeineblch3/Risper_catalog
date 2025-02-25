import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const pictures = [
  "img2",
  "img3",
  "img4",
  "img5",
  "img6",
  "img7",
  "img8",
  "img9",
  "img10",
  "img11",
  "img12",
  "img13",
  "img14",
  "img15",
  "img16",
  "img17",
  "img18",
  "img19",
  "img20",
  "img21",
];

export const pageAtom = atom(0);
export const pages = [
  {
    front: "Tunisia",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
    button: {
      label: "Click Me",
      onClick: () => alert(`Button on Page ${i} clicked!`),
    },
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "Tunisia (1)",
  button: {
    label: "Click Me",
    onClick: () => alert("Button on Back Cover clicked!"),
  },
});

export const UI = () => {
  
  const [page, setPage] = useAtom(pageAtom);
  //change the page value when we press the diffrent bottoms


useEffect(() => {
  const audio = new Audio("/audios/flip.mp3");
  audio.play();
}, [page]);
  return (
    <>
      <main className="pointer-events-none select-none z-20 fixed inset-0 flex justify-between flex-col">
  <a
    className="pointer-events-auto mt-10 ml-10"
    href="https://rispertravel.com/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img className="w-[190px] h-auto" src="/images/logo.png" alt="Logo" />
  </a>
        
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>

      </main>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none">
        <div className="relative">
          <div className="bg-white/0  animate-horizontal-scroll flex items-center gap-8 w-max px-8">
            <h1 className="shrink-0 text-white text-10xl font-black ">
              Come
            </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
              To
            </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">
              Tunisia
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
            Your   
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">
            Adventure
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">
            Begins
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
            here
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
            !
            </h2>
          </div>
          <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
            <h1 className="shrink-0 text-white text-10xl font-black ">
              Come
            </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
              To
            </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">
              Tunisia
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
              Your
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">
              Adventure
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">
              Begins
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
              here
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              !
            </h2>
          </div>
        </div>
      </div>
      
    </>
  );
};