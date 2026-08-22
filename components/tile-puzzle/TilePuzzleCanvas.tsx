'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface DragState {
  isDragging: boolean;
  cellRow: number;
  cellCol: number;
  groupCells: { row: number; col: number }[]; // All cells in the group
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  canvasLeft: number;
  canvasTop: number;
}

interface TilePuzzleCanvasProps {
  imageUrl: string;
  gridSize: number;
  onComplete: (stats: { moves: number; timeElapsed: number }) => void;
  onMoveCountChange: (moves: number) => void;
  onSuccessfulGroup: (connectionCount: number, isComplete: boolean) => void;
}

const GROUP_COLORS = [
  { border: '#10b981', shadow: 'rgba(16, 185, 129, 0.42)' }, // emerald
  { border: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.42)' }, // blue
  { border: '#f97316', shadow: 'rgba(249, 115, 22, 0.42)' }, // orange
  { border: '#a855f7', shadow: 'rgba(168, 85, 247, 0.42)' }, // purple
  { border: '#ec4899', shadow: 'rgba(236, 72, 153, 0.42)' }, // pink
  { border: '#06b6d4', shadow: 'rgba(6, 182, 212, 0.42)' }, // cyan
  { border: '#eab308', shadow: 'rgba(234, 179, 8, 0.42)' }, // yellow
  { border: '#ef4444', shadow: 'rgba(239, 68, 68, 0.42)' }, // red
] as const;

const MAX_INITIAL_SHUFFLE_RETRIES = 3;

function shuffleContentIds(totalCells: number): number[] {
  const contentIds = Array.from({ length: totalCells }, (_, index) => index);

  for (let index = contentIds.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [contentIds[index], contentIds[randomIndex]] = [contentIds[randomIndex], contentIds[index]];
  }

  return contentIds;
}

function countInitiallyGroupedTiles(contentIds: number[], gridSize: number): number {
  const visited = new Set<number>();
  let groupedTileCount = 0;

  const areCorrectNeighbors = (currentIndex: number, neighborIndex: number) => {
    const contentId = contentIds[currentIndex];
    const neighborContentId = contentIds[neighborIndex];
    const currentRow = Math.floor(currentIndex / gridSize);
    const currentCol = currentIndex % gridSize;
    const neighborRow = Math.floor(neighborIndex / gridSize);
    const neighborCol = neighborIndex % gridSize;
    const correctRow = Math.floor(contentId / gridSize);
    const correctCol = contentId % gridSize;
    const correctNeighborRow = Math.floor(neighborContentId / gridSize);
    const correctNeighborCol = neighborContentId % gridSize;

    return correctNeighborRow - correctRow === neighborRow - currentRow
      && correctNeighborCol - correctCol === neighborCol - currentCol;
  };

  const collectGroup = (startIndex: number) => {
    const group: number[] = [];
    const pending = [startIndex];

    while (pending.length > 0) {
      const currentIndex = pending.pop();
      if (currentIndex === undefined || visited.has(currentIndex)) continue;

      visited.add(currentIndex);
      group.push(currentIndex);

      const row = Math.floor(currentIndex / gridSize);
      const col = currentIndex % gridSize;
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];

      for (const [neighborRow, neighborCol] of neighbors) {
        if (
          neighborRow < 0
          || neighborRow >= gridSize
          || neighborCol < 0
          || neighborCol >= gridSize
        ) {
          continue;
        }

        const neighborIndex = neighborRow * gridSize + neighborCol;
        if (!visited.has(neighborIndex) && areCorrectNeighbors(currentIndex, neighborIndex)) {
          pending.push(neighborIndex);
        }
      }
    }

    return group;
  };

  for (let index = 0; index < contentIds.length; index++) {
    if (visited.has(index)) continue;

    const group = collectGroup(index);
    if (group.length > 1) groupedTileCount += group.length;
  }

  return groupedTileCount;
}

export default function TilePuzzleCanvas({
  imageUrl,
  gridSize,
  onComplete,
  onMoveCountChange,
  onSuccessfulGroup,
}: TilePuzzleCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<number[][]>([]); // grid[row][col] = contentId
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [moves, setMoves] = useState(0);
  const [availableSize, setAvailableSize] = useState(600);
  const [celebratingContentIds, setCelebratingContentIds] = useState<Set<number>>(new Set());
  const startTimeRef = useRef(0);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate sizes
  const { containerSize, tileSize } = useMemo(() => {
    const containerWidth = availableSize;
    const calculatedTileSize = Math.floor(containerWidth / gridSize);
    const calculatedContainerSize = calculatedTileSize * gridSize;

    return {
      containerSize: {
        width: calculatedContainerSize,
        height: calculatedContainerSize
      },
      tileSize: calculatedTileSize
    };
  }, [availableSize, gridSize]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateAvailableSize = () => {
      const width = wrapper.clientWidth;
      const viewportRoom = window.innerHeight - wrapper.getBoundingClientRect().top - 8;
      setAvailableSize(Math.max(240, Math.min(width, viewportRoom)));
    };

    updateAvailableSize();
    const observer = new ResizeObserver(updateAvailableSize);
    observer.observe(wrapper);
    window.addEventListener('resize', updateAvailableSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateAvailableSize);
    };
  }, [grid.length]);

  useEffect(() => () => {
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
  }, []);

  // Notify parent of move count changes
  useEffect(() => {
    onMoveCountChange(moves);
  }, [moves, onMoveCountChange]);

  // Initialize grid with shuffled content
  useEffect(() => {
    const initializeTimer = window.setTimeout(() => {
      const totalCells = gridSize * gridSize;
      const maxInitiallyGroupedTiles = totalCells / 3;
      let contentIds = shuffleContentIds(totalCells);

      // Keep the opening board challenging when random placement happens to
      // create too many correct groups. The initial shuffle may be retried
      // up to three times, then the final result is used.
      for (let retry = 0; retry < MAX_INITIAL_SHUFFLE_RETRIES; retry++) {
        if (countInitiallyGroupedTiles(contentIds, gridSize) < maxInitiallyGroupedTiles) {
          break;
        }

        contentIds = shuffleContentIds(totalCells);
      }

      // Convert to 2D grid
      const initialGrid: number[][] = [];
      for (let r = 0; r < gridSize; r++) {
        const row: number[] = [];
        for (let c = 0; c < gridSize; c++) {
          row.push(contentIds[r * gridSize + c]);
        }
        initialGrid.push(row);
      }

      setGrid(initialGrid);
      startTimeRef.current = Date.now();
    }, 0);

    return () => window.clearTimeout(initializeTimer);
  }, [gridSize]);

  // Find all cells that form correct groups based on relative positioning
  const getCorrectGroups = useCallback((currentGrid: number[][] = grid): Map<string, { row: number; col: number }[]> => {
    const groups = new Map<string, { row: number; col: number }[]>();
    const visited = new Set<string>();

    // Check if two adjacent cells should be grouped (relative position is correct)
    const shouldBeGrouped = (r1: number, c1: number, r2: number, c2: number): boolean => {
      const content1 = currentGrid[r1]?.[c1];
      const content2 = currentGrid[r2]?.[c2];

      if (content1 === undefined || content2 === undefined) return false;

      // Calculate correct positions for both contents
      const correctRow1 = Math.floor(content1 / gridSize);
      const correctCol1 = content1 % gridSize;
      const correctRow2 = Math.floor(content2 / gridSize);
      const correctCol2 = content2 % gridSize;

      // Check if they should be adjacent in the correct puzzle
      const correctDr = correctRow2 - correctRow1;
      const correctDc = correctCol2 - correctCol1;
      const isAdjacentInCorrect = (Math.abs(correctDr) === 1 && correctDc === 0) ||
                                   (Math.abs(correctDc) === 1 && correctDr === 0);

      if (!isAdjacentInCorrect) return false;

      // Check if current relative position matches correct relative position
      const currentDr = r2 - r1;
      const currentDc = c2 - c1;

      return currentDr === correctDr && currentDc === correctDc;
    };

    const dfs = (r: number, c: number, group: { row: number; col: number }[]) => {
      const key = `${r},${c}`;
      if (visited.has(key)) return;

      visited.add(key);
      group.push({ row: r, col: c });

      // Check adjacent cells (horizontal and vertical only)
      const directions = [
        { dr: 0, dc: -1 }, // left
        { dr: 0, dc: 1 },  // right
        { dr: -1, dc: 0 }, // up
        { dr: 1, dc: 0 },  // down
      ];

      for (const { dr, dc } of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
          if (shouldBeGrouped(r, c, nr, nc)) {
            dfs(nr, nc, group);
          }
        }
      }
    };

    // Start DFS from each unvisited cell
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const key = `${r},${c}`;
        if (!visited.has(key)) {
          const group: { row: number; col: number }[] = [];
          dfs(r, c, group);
          if (group.length > 1) {
            // Use first cell as group identifier
            const groupKey = `${group[0].row},${group[0].col}`;
            groups.set(groupKey, group);
          }
        }
      }
    }

    return groups;
  }, [grid, gridSize]);

  const getCorrectConnections = useCallback((currentGrid: number[][]) => {
    const connections = new Set<string>();
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
    ];

    currentGrid.forEach((row, r) => {
      row.forEach((contentId, c) => {
        directions.forEach(({ dr, dc }) => {
          const neighbor = currentGrid[r + dr]?.[c + dc];
          if (neighbor === undefined) return;

          const contentRow = Math.floor(contentId / gridSize);
          const contentCol = contentId % gridSize;
          const neighborRow = Math.floor(neighbor / gridSize);
          const neighborCol = neighbor % gridSize;

          if (neighborRow - contentRow === dr && neighborCol - contentCol === dc) {
            connections.add(`${contentId}:${neighbor}`);
          }
        });
      });
    });

    return connections;
  }, [gridSize]);

  // Get the group that contains a specific cell
  const getGroupForCell = useCallback((row: number, col: number): { row: number; col: number }[] => {
    const groups = getCorrectGroups();

    for (const group of groups.values()) {
      if (group.some(cell => cell.row === row && cell.col === col)) {
        return group;
      }
    }

    // If not in any group, return just this cell
    return [{ row, col }];
  }, [getCorrectGroups]);

  // Check completion
  const checkCompletion = useCallback((currentGrid: number[][], moveCount: number) => {
    const allCorrect = currentGrid.every((row, r) =>
      row.every((contentId, c) => contentId === r * gridSize + c)
    );

    if (allCorrect) {
      const timeElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onComplete({ moves: moveCount, timeElapsed });
    }
    return allCorrect;
  }, [gridSize, onComplete]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, row: number, col: number) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const groupCells = getGroupForCell(row, col);

    setDragState({
      isDragging: true,
      cellRow: row,
      cellCol: col,
      groupCells,
      offsetX: clientX - rect.left - col * tileSize,
      offsetY: clientY - rect.top - row * tileSize,
      startX: clientX,
      startY: clientY,
      canvasLeft: rect.left,
      canvasTop: rect.top,
    });
  }, [getGroupForCell, tileSize]);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState?.isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState(prev => prev ? {
      ...prev,
      startX: clientX,
      startY: clientY,
    } : null);
  }, [dragState?.isDragging]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragState?.isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      setDragState(null);
      return;
    }

    // Calculate target cell based on mouse position
    const mouseX = dragState.startX - rect.left;
    const mouseY = dragState.startY - rect.top;

    let targetCol = Math.floor(mouseX / tileSize);
    let targetRow = Math.floor(mouseY / tileSize);

    // Clamp to grid bounds
    targetCol = Math.max(0, Math.min(gridSize - 1, targetCol));
    targetRow = Math.max(0, Math.min(gridSize - 1, targetRow));

    const { cellRow, cellCol, groupCells } = dragState;

    // Check if actually moved to a different cell
    if (targetRow === cellRow && targetCol === cellCol) {
      setDragState(null);
      return;
    }

    // Calculate group bounds
    const minRow = Math.min(...groupCells.map(c => c.row));
    const maxRow = Math.max(...groupCells.map(c => c.row));
    const minCol = Math.min(...groupCells.map(c => c.col));
    const maxCol = Math.max(...groupCells.map(c => c.col));

    const groupHeight = maxRow - minRow + 1;
    const groupWidth = maxCol - minCol + 1;

    // Calculate offset from dragged cell to group's top-left
    const offsetRow = cellRow - minRow;
    const offsetCol = cellCol - minCol;

    // Calculate where the group's top-left should be
    let newMinRow = targetRow - offsetRow;
    let newMinCol = targetCol - offsetCol;

    // Ensure group stays within bounds
    if (newMinRow < 0) newMinRow = 0;
    if (newMinCol < 0) newMinCol = 0;
    if (newMinRow + groupHeight > gridSize) newMinRow = gridSize - groupHeight;
    if (newMinCol + groupWidth > gridSize) newMinCol = gridSize - groupWidth;

    if (newMinRow === minRow && newMinCol === minCol) {
      setDragState(null);
      return;
    }

    // Build sets for old and new positions
    const oldPositions = new Set(groupCells.map(c => `${c.row},${c.col}`));
    const newPositions = new Set<string>();
    const positionMapping = new Map<string, string>(); // old -> new

    groupCells.forEach(cell => {
      const relRow = cell.row - minRow;
      const relCol = cell.col - minCol;
      const newRow = newMinRow + relRow;
      const newCol = newMinCol + relCol;
      const newPosKey = `${newRow},${newCol}`;

      newPositions.add(newPosKey);
      positionMapping.set(`${cell.row},${cell.col}`, newPosKey);
    });

    // Find positions that need to be swapped
    const onlyInOld: string[] = []; // Positions to be vacated
    const onlyInNew: string[] = []; // Positions being occupied

    oldPositions.forEach(pos => {
      if (!newPositions.has(pos)) {
        onlyInOld.push(pos);
      }
    });

    newPositions.forEach(pos => {
      if (!oldPositions.has(pos)) {
        onlyInNew.push(pos);
      }
    });

    // Create new grid
    const newGrid = grid.map(row => [...row]);

    // Save content from positions that will be displaced
    const displacedContent: number[] = [];
    onlyInNew.forEach(pos => {
      const [r, c] = pos.split(',').map(Number);
      displacedContent.push(newGrid[r][c]);
    });

    // Move group to new positions
    groupCells.forEach(cell => {
      const newPosKey = positionMapping.get(`${cell.row},${cell.col}`)!;
      const [newRow, newCol] = newPosKey.split(',').map(Number);
      newGrid[newRow][newCol] = grid[cell.row][cell.col];
    });

    // Fill vacated old positions with displaced content
    onlyInOld.forEach((pos, index) => {
      const [r, c] = pos.split(',').map(Number);
      newGrid[r][c] = displacedContent[index];
    });

    const previousConnections = getCorrectConnections(grid);
    const nextConnections = getCorrectConnections(newGrid);
    const newConnections = [...nextConnections].filter(connection => !previousConnections.has(connection));
    const nextMoves = moves + 1;

    setGrid(newGrid);
    setMoves(nextMoves);
    setDragState(null);

    const isComplete = checkCompletion(newGrid, nextMoves);

    if (newConnections.length > 0) {
      const joinedContentIds = new Set(
        newConnections.flatMap(connection => connection.split(':').map(Number))
      );
      setCelebratingContentIds(joinedContentIds);
      onSuccessfulGroup(newConnections.length, isComplete);

      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = setTimeout(() => {
        setCelebratingContentIds(new Set());
      }, 700);
    }
  }, [dragState, grid, gridSize, moves, tileSize, checkCompletion, getCorrectConnections, onSuccessfulGroup]);

  // Setup event listeners
  useEffect(() => {
    if (dragState?.isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [dragState?.isDragging, handleDragMove, handleDragEnd]);

  if (grid.length === 0) {
    return <div ref={wrapperRef} className="flex w-full justify-center" />;
  }

  const correctGroups = getCorrectGroups();
  const groupInfoByCell = new Map<string, {
    cells: { row: number; col: number }[];
    color: (typeof GROUP_COLORS)[number];
  }>();

  // Sort by the smallest content id so a group's color remains stable while it is moved.
  const sortedGroups = Array.from(correctGroups.values()).sort((groupA, groupB) => {
    const firstContentA = Math.min(...groupA.map(cell => grid[cell.row][cell.col]));
    const firstContentB = Math.min(...groupB.map(cell => grid[cell.row][cell.col]));
    return firstContentA - firstContentB;
  });

  sortedGroups.forEach((group, groupIndex) => {
    const color = GROUP_COLORS[groupIndex % GROUP_COLORS.length];
    group.forEach(cell => {
      groupInfoByCell.set(`${cell.row},${cell.col}`, { cells: group, color });
    });
  });

  // Helper function to check if a cell is in a group and which borders should be shown
  const getBorderStyle = (
    r: number,
    c: number,
    groupCells: { row: number; col: number }[] | null,
    groupColor: (typeof GROUP_COLORS)[number] | null,
  ) => {
    if (!groupCells || groupCells.length <= 1) {
      // Not in a group, show all borders
      return {
        borderTop: '3px solid rgba(255, 255, 255, 0.6)',
        borderRight: '3px solid rgba(255, 255, 255, 0.6)',
        borderBottom: '3px solid rgba(255, 255, 255, 0.6)',
        borderLeft: '3px solid rgba(255, 255, 255, 0.6)',
      };
    }

    // In a group, only show borders on the outer edges
    const hasTop = !groupCells.some(cell => cell.row === r - 1 && cell.col === c);
    const hasRight = !groupCells.some(cell => cell.row === r && cell.col === c + 1);
    const hasBottom = !groupCells.some(cell => cell.row === r + 1 && cell.col === c);
    const hasLeft = !groupCells.some(cell => cell.row === r && cell.col === c - 1);

    return {
      borderTop: hasTop ? `3px solid ${groupColor?.border ?? '#10b981'}` : 'none',
      borderRight: hasRight ? `3px solid ${groupColor?.border ?? '#10b981'}` : 'none',
      borderBottom: hasBottom ? `3px solid ${groupColor?.border ?? '#10b981'}` : 'none',
      borderLeft: hasLeft ? `3px solid ${groupColor?.border ?? '#10b981'}` : 'none',
    };
  };

  return (
    <div ref={wrapperRef} className="flex w-full justify-center">
      <div
        ref={canvasRef}
        className="relative overflow-hidden bg-slate-200 dark:bg-slate-800"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          touchAction: 'none', // Prevent all touch gestures (scrolling, pinch-zoom, etc.)
        }}
      >
      {celebratingContentIds.size > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="tile-join-toast pointer-events-none absolute left-1/2 top-4 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/20"
        >
          Pieces joined!
        </div>
      )}

      {/* Grid cells */}
      {grid.map((row, r) =>
        row.map((contentId, c) => {
          const isInDraggingGroup = dragState?.groupCells.some(
            cell => cell.row === r && cell.col === c
          );

          const groupInfo = groupInfoByCell.get(`${r},${c}`);
          const currentGroup = groupInfo?.cells ?? null;
          const groupColor = groupInfo?.color ?? null;

          // Calculate position for dragging group
          let left = c * tileSize;
          let top = r * tileSize;

          if (isInDraggingGroup && dragState) {
            const offsetFromDraggedCell = {
              row: r - dragState.cellRow,
              col: c - dragState.cellCol,
            };

            left = dragState.startX - dragState.canvasLeft - dragState.offsetX + offsetFromDraggedCell.col * tileSize;
            top = dragState.startY - dragState.canvasTop - dragState.offsetY + offsetFromDraggedCell.row * tileSize;
          }

          const contentRow = Math.floor(contentId / gridSize);
          const contentCol = contentId % gridSize;
          const bgPosX = -(contentCol * tileSize);
          const bgPosY = -(contentRow * tileSize);

          const borderStyle = getBorderStyle(r, c, currentGroup, groupColor);

          return (
            <div
              key={`${r}-${c}`}
              aria-label={`Puzzle piece ${contentId + 1}`}
              className={`absolute cursor-grab active:cursor-grabbing ${
                isInDraggingGroup ? 'z-50' : 'z-10'
              } ${!isInDraggingGroup ? 'transition-all duration-200' : ''} ${
                celebratingContentIds.has(contentId) ? 'tile-join-pop' : ''
              }`}
              style={{
                left,
                top,
                width: tileSize,
                height: tileSize,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: `${containerSize.width}px ${containerSize.height}px`,
                backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                ...borderStyle,
                boxShadow: isInDraggingGroup
                  ? `0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3), 0 0 0 2px ${groupColor?.shadow ?? 'rgba(99, 102, 241, 0.4)'}`
                  : currentGroup
                  ? `0 0 0 1px ${groupColor?.shadow ?? 'rgba(16, 185, 129, 0.3)'}`
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onMouseDown={(e) => handleDragStart(e, r, c)}
              onTouchStart={(e) => handleDragStart(e, r, c)}
            />
          );
        })
      )}
      </div>
    </div>
  );
}
