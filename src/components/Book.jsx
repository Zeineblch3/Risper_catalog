import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pages } from "./UI";

const easingFactor = 0.9; // Controls the speed of the easing
const easingFactorFold = 0.1; // Controls the speed of the easing
const insideCurveStrength = 0.15; // Controls the strength of the curve
const outsideCurveStrength = 0.02; // Controls the strength of the curve
const turningCurveStrength = 0.1; // Controls the strength of the curve

const PAGE_WIDTH = 1.3;
const PAGE_HEIGHT = 1.9; 
const PAGE_DEPTH = 0.002;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

// Create a 3D box geometry for the page
const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);
// Move the geometry to the left, like a book
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);
// Get all the position data from the geometry
const position = pageGeometry.attributes.position;
// Create a vertex to avoid creating a new one inside the loop
const vertex = new Vector3();
// Arrays to store skin indexes (for bones) and skin weights
const skinIndexes = [];
const skinWeights = [];

  // Loop through all the vertices
for (let i = 0; i < position.count; i++) {
  // Get the current vertex
  vertex.fromBufferAttribute(position, i); // get the vertex
  const x = vertex.x; // get the x position of the vertex

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // calculate the skin index
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // calculate the skin weight

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0); // Add skin index data
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // set the skin weights
  // The last two values are always 0
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("blue");
 //array of 6 materials 'cause our boxgeometry has 6 faces
    //one material per face
const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
];

pages.forEach((page) => {
  useTexture.preload(`/textures/${page.front}.jpg`);
  useTexture.preload(`/textures/${page.back}.jpg`);
  useTexture.preload(`/textures/img.jpg`);
});

// ...props is a concise way to say: "Take all the properties of the props object and pass them to the component or JSX
const Page = ({ number/* The page number */, front, back, page /*number of the current open page*/, opened, bookClosed, ...props }) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? [`/textures/img.jpg`]
      : []),
  ]);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace; //change color space
  const group = useRef(); // Create and manage a reference (useRef) for the 3D group
  const turnedAt = useRef(0); // make it look like someone is flipping the page
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
     // Create a new mesh with the geometries
    const bones = []; //create our bones with an array
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {//as many bones as we have segments
        // in each segment we will create a bone
      let bone = new Bone();
      bones.push(bone);  //push the bones to the bone array
      if (i === 0) {
         // the first bone is positioned at the start
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      // Connect the bones hierarchically
      if (i > 0) {
        // Add the current bone as a child of the previous bone
        bones[i - 1].add(bone); 
      }
    }
    // Create a skeleton using the bones array
    const skeleton = new Skeleton(bones);
    // Define the materials for the page
    const materials = [
      ...pageMaterials, // Spread the existing materials into the new array

      //for the front page
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture, // Apply an image
        ...(number === 0 // Check if this is the first page
          ? { // If it's the first page
              roughnessMap: pictureRoughness, // Use a texture to control roughness
            }
          : { //if not
              roughness: 0.1, //slightly rough not mat
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      //for the back page
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1 //if it's the last one
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];

    // Create a skinned mesh using the page geometry and materials
    const mesh = new SkinnedMesh(pageGeometry, materials);
    // Enable the mesh to cast shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    // Add the first bone (root bone) to the mesh
    mesh.add(skeleton.bones[0]);
    // Connect the skeleton to the mesh so the bones can move it
    mesh.bind(skeleton);
    return mesh;
  }, [] /*this runs only once*/);

  // useHelper(skinnedMeshRef, SkeletonHelper, "red");

  // access our bones  
    // the animation happen inside the useFrame
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
      //curve up and down with sin
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      //curve down and up with cos
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  const [_, setPage] = useAtom(pageAtom);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  return ( // group: 3D objects
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};
// Define the Book component
// where we render the pages before animating them
export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom); // defined in the UI.jsx
  const [delayedPage, setDelayedPage] = useState(page); // so we can see all pages flipping not at once

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (  // For each pageData element, create a Page component
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}  // to know on which page we're currently are 
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          {...pageData}
        />
      ))}
    </group>
  );
};