import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';

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
    'tetrahedron': { name: 'Tetrahedron', plural: 'Tetrahedra', vertices: 4 },
    'cube': { name: 'Cube', plural: 'Cubes', vertices: 8 },
    'regular-octahedron': { name: 'Octahedron', plural: 'Octahedra', vertices: 6 },
    'regular-dodecahedron': { name: 'Dodecahedron', plural: 'Dodecahedra', vertices: 20 },
    'regular-icosahedron': { name: 'Icosahedron', plural: 'Icosahedra', vertices: 12 }
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
      ].map(v => v.map(c => c * 0.6)),
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
      y: rotatedPoint[1] * scale * factor + 150,
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
        height="300" 
        viewBox="0 0 400 300"
        className="w-full h-full select-none"
        style={{ touchAction: 'none' }}
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
        <text
          x="200"
          y="280"
          textAnchor="middle"
          className="text-sm fill-gray-600"
          style={{ fontSize: '12px' }}
        >
          Drag to rotate the shape and click on the vertices to highlight them
        </text>
      </svg>
    );
  };

  return (
    <>
      <style>{`
        @property --r {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        .glow-button { 
          min-width: auto; 
          height: auto; 
          position: relative; 
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          transition: all .3s ease;
          padding: 7px;
        }

        .glow-button::before {
          content: "";
          display: block;
          position: absolute;
          background: white;
          inset: 2px;
          border-radius: 4px;
          z-index: -2;
        }

        .simple-glow {
          background: conic-gradient(
            from var(--r),
            transparent 0%,
            rgb(0, 255, 132) 2%,
            rgb(0, 214, 111) 8%,
            rgb(0, 174, 90) 12%,
            rgb(0, 133, 69) 14%,
            transparent 15%
          );
          animation: rotating 3s linear infinite;
          transition: animation 0.3s ease;
        }

        .simple-glow.stopped {
          animation: none;
          background: none;
        }

        @keyframes rotating {
          0% {
            --r: 0deg;
          }
          100% {
            --r: 360deg;
          }
        }
      `}</style>
      <div className="w-[500px] h-auto mx-auto mt-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] bg-white rounded-lg overflow-hidden select-none">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#5750E3] text-sm font-medium select-none">Practicing Polyhedron Vertices</h2>
            <button
              onClick={() => {
                setSelectedShape('cube');
                setSelectedVertices(new Set());
                setUserAnswer('');
                setIsCorrect(false);
                setHasError(false);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex">
                <div className="flex flex-col space-y-2 mr-4">
                  {Object.entries(shapeInfo).map(([shape, info]) => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShape(shape)}
                      className={`px-4 py-3 rounded-lg transition-colors text-sm ${
                        selectedShape === shape
                          ? 'bg-[#008545] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {info.name}
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="border border-gray-200 rounded-lg flex-1 min-w-[300px] min-h-[250px] w-full">
                    {renderPolyhedron()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              {!isCorrect ? (
                <>
                  <p className="text-gray-700">How many vertices do {shapeInfo[selectedShape].plural} have?</p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter answer"
                      className={`w-40 px-3 py-2 border rounded-lg ${
                        hasError ? 'border-yellow-500 focus:ring-yellow-500' : 'border-gray-200 focus:ring-[#008545]'
                      } focus:outline-none focus:ring-2`}
                    />
                    <div className="glow-button simple-glow">
                      <Button
                        onClick={handleAnswerSubmit}
                        className="bg-[#00783E] hover:bg-[#006633] text-white text-sm px-4 py-2 rounded"
                      >
                        Check
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-green-600 font-medium">
                  {shapeInfo[selectedShape].plural} have {shapeInfo[selectedShape].vertices} vertices!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolyhedraVertex;