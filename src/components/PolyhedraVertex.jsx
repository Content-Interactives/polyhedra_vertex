import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

const PolyhedraVertex = () => {
  const [selectedShape, setSelectedShape] = useState('cube');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [selectedVertices, setSelectedVertices] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasError, setHasError] = useState(false);
  const svgRef = useRef(null);

  const shapeInfo = {
    'cube': { name: 'Cube', plural: 'Cubes', vertices: 8 }
  };

  const shapes = {
    tetrahedron: {
      vertices: [
        [1, 1, 1],
        [-1, -1, 1],
        [-1, 1, -1],
        [1, -1, -1]
      ].map(v => v.map(c => c / Math.sqrt(3))),
      edges: [
        [0, 1], [1, 2], [2, 0],
        [0, 3], [1, 3], [2, 3]
      ],
      faces: [
        [0, 1, 2],
        [0, 1, 3],
        [1, 2, 3],
        [2, 0, 3]
      ]
    },
    'regular-octahedron': {
      vertices: [
        [1, 0, 0], [-1, 0, 0],
        [0, 1, 0], [0, -1, 0],
        [0, 0, 1], [0, 0, -1]
      ],
      edges: [
        [4, 0], [4, 2], [4, 1], [4, 3],
        [5, 0], [5, 2], [5, 1], [5, 3],
        [0, 2], [2, 1], [1, 3], [3, 0]
      ],
      faces: [
        [4, 0, 2], [4, 2, 1], [4, 1, 3], [4, 3, 0],
        [5, 0, 2], [5, 2, 1], [5, 1, 3], [5, 3, 0]
      ]
    },
    'regular-dodecahedron': {
      vertices: [
        [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
        [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
        [0, 1.618034, 0.618034], [0, 1.618034, -0.618034],
        [0, -1.618034, 0.618034], [0, -1.618034, -0.618034],
        [0.618034, 0, 1.618034], [-0.618034, 0, 1.618034],
        [0.618034, 0, -1.618034], [-0.618034, 0, -1.618034],
        [1.618034, 0.618034, 0], [1.618034, -0.618034, 0],
        [-1.618034, 0.618034, 0], [-1.618034, -0.618034, 0]
      ].map(v => v.map(c => c * 0.4)),
      edges: [
        [0, 16], [0, 12], [0, 8], [1, 16], [1, 14], [1, 9],
        [2, 17], [2, 12], [2, 10], [3, 17], [3, 14], [3, 11],
        [4, 18], [4, 13], [4, 8], [5, 18], [5, 15], [5, 9],
        [6, 19], [6, 13], [6, 10], [7, 19], [7, 15], [7, 11],
        [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19]
      ],
      faces: [
        [0, 8, 4, 13, 12],
        [1, 9, 5, 15, 14],
        [2, 10, 6, 13, 12],
        [3, 11, 7, 15, 14],
        [0, 16, 17, 2, 12],
        [1, 16, 17, 3, 14],
        [4, 18, 19, 6, 13],
        [5, 18, 19, 7, 15],
        [0, 8, 9, 1, 16],
        [2, 10, 11, 3, 17],
        [4, 8, 9, 5, 18],
        [6, 10, 11, 7, 19]
      ]
    },
    'regular-icosahedron': {
      vertices: [
        [0, 1, 1.618], [0, -1, 1.618], [0, 1, -1.618], [0, -1, -1.618],
        [1, 1.618, 0], [-1, 1.618, 0], [1, -1.618, 0], [-1, -1.618, 0],
        [1.618, 0, 1], [-1.618, 0, 1], [1.618, 0, -1], [-1.618, 0, -1]
      ].map(v => v.map(c => c * 0.5)),
      edges: [
        [0, 1], [0, 4], [0, 5], [0, 8], [0, 9],
        [1, 6], [1, 7], [1, 8], [1, 9],
        [2, 3], [2, 4], [2, 5], [2, 10], [2, 11],
        [3, 6], [3, 7], [3, 10], [3, 11],
        [4, 5], [4, 8], [4, 10],
        [5, 9], [5, 11],
        [6, 7], [6, 8], [6, 10],
        [7, 9], [7, 11],
        [8, 10],
        [9, 11]
      ],
      faces: [
        [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
        [3, 2, 11], [3, 11, 7], [3, 7, 6], [3, 6, 10], [3, 10, 2],
        [1, 6, 8], [2, 4, 10], [5, 2, 11], [6, 3, 10], [7, 1, 9],
        [8, 6, 10], [9, 5, 11], [10, 4, 8], [11, 9, 7], [7, 3, 6]
      ]
    },
    cube: {
      vertices: [
        [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
        [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]
      ],
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ],
      faces: [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [2, 3, 7, 6],
        [0, 3, 7, 4],
        [1, 2, 6, 5]
      ]
    }
  };

  const handleAnswerSubmit = () => {
    const correctAnswer = shapeInfo[selectedShape].vertices;
    if (parseInt(userAnswer) === correctAnswer) {
      setIsCorrect(true);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const resetAnswer = () => {
    setUserAnswer('');
    setIsCorrect(false);
    setHasError(false);
  };

  useEffect(() => {
    resetAnswer();
  }, [selectedShape]);

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const rotatePoint = (point, rotation) => {
    const { x: rx, y: ry } = rotation;
    const cosX = Math.cos(toRadians(rx));
    const sinX = Math.sin(toRadians(rx));
    const cosY = Math.cos(toRadians(ry));
    const sinY = Math.sin(toRadians(ry));

    const y1 = point[1] * cosX - point[2] * sinX;
    const z1 = point[1] * sinX + point[2] * cosX;

    const x2 = point[0] * cosY + z1 * sinY;
    const z2 = -point[0] * sinY + z1 * cosY;

    return [x2, y1, z2];
  };

  const project = (point) => {
    const rotatedPoint = rotatePoint(point, rotation);
    const scale = 100;
    const perspective = 4;
    const factor = perspective / (perspective + rotatedPoint[2]);
    
    return {
      x: rotatedPoint[0] * scale * factor + 200,
      y: rotatedPoint[1] * scale * factor + 200,
      z: rotatedPoint[2]
    };
  };

  const getFaceCenter = (vertices, face) => {
    const points = face.map(idx => vertices[idx]);
    const center = points.reduce(
      (acc, point) => [acc[0] + point[0], acc[1] + point[1], acc[2] + point[2]],
      [0, 0, 0]
    );
    return center.map(coord => coord / face.length);
  };

  const handleVertexClick = (index, event) => {
    event.stopPropagation();
    setSelectedVertices(prev => {
      const newSet = new Set(prev);
      newSet.add(`${selectedShape}-${index}`);
      return newSet;
    });
  };

  const handleMouseDown = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRotation(prev => ({
      x: prev.x - (y - dragStart.y) * 0.5,
      y: prev.y - (x - dragStart.x) * 0.5
    }));

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const renderPolyhedron = () => {
    const shape = shapes[selectedShape];
    const projectedVertices = shape.vertices.map(project);

    const sortedFaces = [...shape.faces].map((face, index) => ({
      vertices: face,
      center: getFaceCenter(shape.vertices, face),
      index
    })).sort((a, b) => {
      const centerA = rotatePoint(a.center, rotation)[2];
      const centerB = rotatePoint(b.center, rotation)[2];
      return centerB - centerA;
    });

    const colors = [
      '#0ea5e9', '#48bb78', '#ed8936', 
      '#ed64a6', '#667eea', '#d69e2e'
    ];

    return (
      <svg 
        ref={svgRef}
        width="400" 
        height="400" 
        className="bg-sky-50 rounded-lg cursor-move shadow-md"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {sortedFaces.map(({ vertices, index }) => (
          <polygon
            key={`face-${index}`}
            points={vertices
              .map(v => `${projectedVertices[v].x},${projectedVertices[v].y}`)
              .join(' ')}
            fill={colors[index % colors.length]}
            fillOpacity="0.5"
            stroke="#0ea5e9"
            strokeWidth="2"
          />
        ))}
        
        {projectedVertices.map((vertex, index) => (
          <circle
            key={index}
            cx={vertex.x}
            cy={vertex.y}
            r={selectedVertices.has(`${selectedShape}-${index}`) ? "6" : "4"}
            fill={selectedVertices.has(`${selectedShape}-${index}`) ? "#22c55e" : "#0ea5e9"}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer hover:fill-green-400"
            onClick={(e) => handleVertexClick(index, e)}
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <Card className="w-full max-w-4xl mx-auto shadow-md bg-white">
        <CardHeader className="bg-sky-100 text-sky-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">Polyhedron Vertex Explorer</CardTitle>
          </div>
          <CardDescription className="text-sky-700 text-lg">Find out what the vertices of a shape are!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-700">What is a Vertex?</AlertTitle>
            <AlertDescription className="text-blue-600">
              A vertex of a polyhedron is a point where three or more edges meet. You can think of it as a corner of the shape. For example, in a cube, each of the eight corners is a vertex. Try identifying all of the vertices of the following shapes!
            </AlertDescription>
          </Alert>
          <div className="space-y-6">
            <div className="flex gap-3 flex-wrap justify-center">
              {[
                ['cube', 'Cube', 8]
              ].map(([shape, displayName]) => (
                <button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedShape === shape
                      ? 'bg-sky-500 text-white'
                      : 'bg-sky-100 hover:bg-sky-200 text-sky-700'
                  }`}
                >
                  {displayName}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              {renderPolyhedron()}
            </div>
            <div className="flex justify-center items-center space-x-4">
              {!isCorrect ? (
                <>
                  <p className="text-sky-700">How many vertices do {shapeInfo[selectedShape].plural} have?</p>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className={`w-20 px-3 py-2 border rounded-lg ${
                      hasError ? 'border-red-500 focus:ring-red-500' : 'border-sky-200 focus:ring-sky-500'
                    } focus:outline-none focus:ring-2`}
                  />
                  <button
                    onClick={handleAnswerSubmit}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Check
                  </button>
                </>
              ) : (
                <p className="text-green-600 font-medium">
                  {shapeInfo[selectedShape].plural} have {shapeInfo[selectedShape].vertices} vertices.
                </p>
              )}
            </div>
            <p className="text-sm text-sky-600 text-center">
              Drag to rotate the shape and click on the vertices to highlight them
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolyhedraVertex;