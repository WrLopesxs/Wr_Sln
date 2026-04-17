"use client"

import { useState } from "react"
import { DotOrbit, MeshGradient } from "@paper-design/shaders-react"

export default function DemoOne() {
  const [intensity] = useState(1.35)
  const [speed] = useState(0.9)
  const [activeEffect] = useState("combined")

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#07090f]">
      {activeEffect === "mesh" && (
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          colors={["#07090f", "#0d1220", "#3ab8ff", "#8a7dff"]}
          speed={speed}
          backgroundColor="#07090f"
        />
      )}

      {activeEffect === "dots" && (
        <div className="absolute inset-0 h-full w-full bg-[#07090f]">
          <DotOrbit
            className="h-full w-full"
            dotColor="#6df1d8"
            orbitColor="#111725"
            speed={speed}
            intensity={intensity}
          />
        </div>
      )}

      {activeEffect === "combined" && (
        <>
          <MeshGradient
            className="absolute inset-0 h-full w-full"
            colors={["#07090f", "#0d1220", "#3ab8ff", "#8a7dff"]}
            speed={speed * 0.5}
            wireframe="true"
            backgroundColor="#07090f"
          />
          <div className="absolute inset-0 h-full w-full opacity-50">
            <DotOrbit
              className="h-full w-full"
              dotColor="#6df1d8"
              orbitColor="#111725"
              speed={speed * 1.5}
              intensity={intensity * 0.8}
            />
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl animate-pulse"
          style={{ animationDuration: `${3 / speed}s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl animate-pulse"
          style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-teal-300/10 blur-xl animate-pulse"
          style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
        />
      </div>
    </div>
  )
}
