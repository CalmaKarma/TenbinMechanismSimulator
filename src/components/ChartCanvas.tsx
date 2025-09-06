import React, { useEffect, useRef, useState, useCallback } from 'react';
// @ts-ignore
import * as d3 from 'd3';
import useAppStore from '../store/useAppStore';
import { calculateVoterMove, isValidEntitySellMove } from '../utils/pythagorean';

interface TooltipData {
  x: number;
  y: number;
  C: number;
  Rep: number;
  voterHoldings: { X: number; Y: number } | null;
  tokenEarned: number | null;
  profit: number | null;
  isValid: boolean | null;
}

const ChartCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ data: TooltipData; x: number; y: number } | null>(null);
  const [showOversellLimits, setShowOversellLimits] = useState(true);
  const [showBuyingZones, setShowBuyingZones] = useState(true);
  const [showPriceCircles, setShowPriceCircles] = useState(true);
  
  const {
    allTriples,
    voterBuy,
    entityPosition,
    voterMove,
    allowUnilateralIncrement,
    isInitialized,
    isVoterAndEntityApplied,
    axisLimit
  } = useAppStore();

  const renderChart = useCallback(() => {
    if (!svgRef.current || !isInitialized || allTriples.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 清除之前的内容
    
    // 重置SVG属性以防止累积的样式变更
    svg.attr("style", null);

    const container = svgRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    // 确保1:1宽高比，取较小的尺寸作为正方形边长
    const availableWidth = containerRect.width - margin.left - margin.right;
    const availableHeight = containerRect.height - margin.top - margin.bottom;
    const size = Math.min(availableWidth, availableHeight);
    
    const width = size;
    const height = size;

    // 设置SVG尺寸
    svg.attr("width", containerRect.width).attr("height", containerRect.height);

    // 创建剪裁路径
    const defs = svg.append("defs");
    defs.append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // 创建主绘图区域
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 设置比例尺 - 使用固定的axisLimit而不是数据的最大值
    const xScale = d3.scaleLinear()
      .domain([0, axisLimit])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, axisLimit])
      .range([height, 0]);

    // 创建缩放行为，限制在有效范围内
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", function(event) {
        const { transform } = event;
        
        // 更新比例尺
        let newXScale = transform.rescaleX(xScale);
        let newYScale = transform.rescaleY(yScale);
        
        // 限制域在有效范围内
        const xDomain = newXScale.domain();
        const yDomain = newYScale.domain();
        
        // 确保域不会超出 [0, axisLimit] 范围
        const clampedXDomain = [
          Math.max(0, xDomain[0]),
          Math.min(axisLimit, xDomain[1])
        ];
        const clampedYDomain = [
          Math.max(0, yDomain[0]),
          Math.min(axisLimit, yDomain[1])
        ];
        
        // 如果域被限制了，重新创建比例尺
        if (clampedXDomain[0] !== xDomain[0] || clampedXDomain[1] !== xDomain[1]) {
          newXScale = d3.scaleLinear()
            .domain(clampedXDomain)
            .range([0, width]);
        }
        if (clampedYDomain[0] !== yDomain[0] || clampedYDomain[1] !== yDomain[1]) {
          newYScale = d3.scaleLinear()
            .domain(clampedYDomain)
            .range([height, 0]);
        }
        
        // 更新坐标轴
        gX.call(d3.axisBottom(newXScale).ticks(10));
        gY.call(d3.axisLeft(newYScale).ticks(10));
        
        // 更新网格线
        gridX.call(d3.axisBottom(newXScale)
          .tickSize(-height)
          .tickFormat(() => "")
        );
        gridY.call(d3.axisLeft(newYScale)
          .tickSize(-width)
          .tickFormat(() => "")
        );
        
        // 更新所有图形元素
        updateElements(newXScale, newYScale);
      });

    // 应用缩放到SVG
    svg.call(zoom as any);

    // 创建坐标轴组
    const gX = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`);
      
    const gY = g.append("g")
      .attr("class", "y-axis");

    // 添加网格线
    const gridX = g.append("g")
      .attr("class", "grid x-grid")
      .attr("transform", `translate(0,${height})`)
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);

    const gridY = g.append("g")
      .attr("class", "grid y-grid")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);

    // 创建用于所有图形元素的容器，应用剪裁
    const chartContent = g.append("g")
      .attr("clip-path", "url(#chart-clip)");

    // 初始绘制坐标轴
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    gX.call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 45)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("x (Distrust Votes)");

    gY.call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("y (Trust Votes)");

    // 初始绘制网格线
    gridX.call(d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat(() => "")
    );
    gridY.call(d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => "")
    );

     // 更新图形元素的函数
     function updateElements(newXScale: any, newYScale: any) {
       // 清除旧的图形元素
       chartContent.selectAll(".chart-element").remove();
       
       // 如果voter和entity设置尚未应用，只显示散点图
       if (!isVoterAndEntityApplied || !voterMove) {
         // 只绘制格点，不绘制任何覆盖层
         drawLatticePoints(newXScale, newYScale);
         return;
       }

      const deltaX = voterMove.deltaX;
      const deltaY = voterMove.deltaY;
      const deltaC = voterMove.deltaC;

      // 计算阴影区域坐标
      const leftShadeX = entityPosition.x_cur - deltaX;
      const bottomShadeY = entityPosition.y_cur - deltaY;

       // 添加阴影区域和线条 - 根据切换开关控制
       if (showOversellLimits) {
         // 左侧灰色阴影 (x < x_cur - Δx)
         if (leftShadeX > 0) {
           chartContent.append("rect")
             .attr("class", "chart-element shade")
             .attr("x", 0)
             .attr("y", 0)
             .attr("width", newXScale(leftShadeX))
             .attr("height", height)
             .attr("fill", "#666666")
             .attr("opacity", 0.4);
         }

         // 下方灰色阴影 (y < y_cur - Δy)
         if (bottomShadeY > 0) {
           chartContent.append("rect")
             .attr("class", "chart-element shade")
             .attr("x", 0)
             .attr("y", newYScale(bottomShadeY))
             .attr("width", width)
             .attr("height", height - newYScale(bottomShadeY))
             .attr("fill", "#666666")
             .attr("opacity", 0.4);
         }
       }

       // 价格圆圈 - 根据切换开关控制
       if (showPriceCircles) {
         // 内圆 (C_cur - ΔC) - 深绿色
         const innerRadius = newXScale(entityPosition.C_cur - deltaC) - newXScale(0);
         if (innerRadius > 0) {
           chartContent.append("circle")
             .attr("class", "chart-element circle")
             .attr("cx", newXScale(0))
             .attr("cy", newYScale(0))
             .attr("r", innerRadius)
             .attr("fill", "green")
             .attr("fill-opacity", 0.2)
             .attr("stroke", "darkgreen")
             .attr("stroke-width", 2)
             .attr("stroke-dasharray", "3,3");
         }

         // 外圆 (C_cur) - 浅绿色
         const outerRadius = newXScale(entityPosition.C_cur) - newXScale(0);
         chartContent.append("circle")
           .attr("class", "chart-element circle")
           .attr("cx", newXScale(0))
           .attr("cy", newYScale(0))
           .attr("r", outerRadius)
           .attr("fill", "lightgreen")
           .attr("fill-opacity", 0.15)
           .attr("stroke", "green")
           .attr("stroke-width", 2)
           .attr("stroke-dasharray", "5,5");
       }

      // 购买区域 - 根据切换开关控制
      if (showBuyingZones) {
        // 右侧红色阴影 (x > x_cur)
        if (newXScale(entityPosition.x_cur) < width) {
          chartContent.append("rect")
            .attr("class", "chart-element shade")
            .attr("x", newXScale(entityPosition.x_cur))
            .attr("y", 0)
            .attr("width", Math.max(0, width - newXScale(entityPosition.x_cur)))
            .attr("height", height)
            .attr("fill", "red")
            .attr("opacity", 0.2);
        }

        // 上方红色阴影 (y > y_cur)
        if (newYScale(entityPosition.y_cur) > 0) {
          chartContent.append("rect")
            .attr("class", "chart-element shade")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", Math.max(0, newYScale(entityPosition.y_cur)))
            .attr("fill", "red")
            .attr("opacity", 0.2);
        }
      }

      // 添加虚线
      // 垂直虚线 x = x_cur - Δx
      if (leftShadeX > 0) {
        chartContent.append("line")
          .attr("class", "chart-element line")
          .attr("x1", newXScale(leftShadeX))
          .attr("y1", 0)
          .attr("x2", newXScale(leftShadeX))
          .attr("y2", height)
          .attr("stroke", "gray")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }

      // 水平虚线 y = y_cur - Δy
      if (bottomShadeY > 0) {
        chartContent.append("line")
          .attr("class", "chart-element line")
          .attr("x1", 0)
          .attr("y1", newYScale(bottomShadeY))
          .attr("x2", width)
          .attr("y2", newYScale(bottomShadeY))
          .attr("stroke", "gray")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }

      // 垂直虚线 x = x_cur
      chartContent.append("line")
        .attr("class", "chart-element line")
        .attr("x1", newXScale(entityPosition.x_cur))
        .attr("y1", 0)
        .attr("x2", newXScale(entityPosition.x_cur))
        .attr("y2", height)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      // 水平虚线 y = y_cur
      chartContent.append("line")
        .attr("class", "chart-element line")
        .attr("x1", 0)
        .attr("y1", newYScale(entityPosition.y_cur))
        .attr("x2", width)
        .attr("y2", newYScale(entityPosition.y_cur))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

       // 绘制格点
       drawLatticePoints(newXScale, newYScale);
     }
     
     // 绘制格点的独立函数
     function drawLatticePoints(newXScale: any, newYScale: any) {
       chartContent.selectAll(".lattice-point")
         .data(allTriples)
         .enter()
         .append("circle")
         .attr("class", "chart-element lattice-point")
         .attr("cx", d => newXScale(d.x))
         .attr("cy", d => newYScale(d.y))
         .attr("r", 4)
         .attr("fill", d => {
           // 如果voter和entity尚未应用，所有点都是蓝色
           if (!isVoterAndEntityApplied) {
             return "steelblue";
           }
           
           // 判断点的颜色
           if (d.x === entityPosition.x_cur && d.y === entityPosition.y_cur) {
             return "red"; // 当前实体位置
           }
           if (d.x === voterBuy.x1 && d.y === voterBuy.y1) {
             return "blue"; // Buy Start - 蓝色
           }
           if (d.x === voterBuy.x2 && d.y === voterBuy.y2) {
             return "#f97316"; // Buy Target - 橙色
           }
           
          // 检查是否为有效目标点 - 使用新的实体卖出逻辑
          const voterMove = calculateVoterMove(
            { x: voterBuy.x1, y: voterBuy.y1 },
            { x: voterBuy.x2, y: voterBuy.y2 }
          );
          
          const isValid = isValidEntitySellMove(
            d, // 实体卖出目标
            { x: entityPosition.x_cur, y: entityPosition.y_cur }, // 当前实体位置
            { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY }, // 投票者持有量
            allowUnilateralIncrement,
            axisLimit
          );
          
          if (isValid) {
            return "#22c55e"; // 有效目标点 - 绿色填充
          }
           
           return "#999999"; // 普通格点 - 灰色
         })
         .attr("stroke", d => {
           // 为有效目标点添加深绿边框
           if (isVoterAndEntityApplied) {
             const voterMove = calculateVoterMove(
               { x: voterBuy.x1, y: voterBuy.y1 },
               { x: voterBuy.x2, y: voterBuy.y2 }
             );
             
             const isValid = isValidEntitySellMove(
               d,
               { x: entityPosition.x_cur, y: entityPosition.y_cur },
               { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY },
               allowUnilateralIncrement,
               axisLimit
             );
             
             if (isValid) {
               return "#15803d"; // 深绿色边框
             }
           }
           return "white";
         })
         .attr("stroke-width", d => {
           // 为有效目标点添加更粗的边框
           if (isVoterAndEntityApplied) {
             const voterMove = calculateVoterMove(
               { x: voterBuy.x1, y: voterBuy.y1 },
               { x: voterBuy.x2, y: voterBuy.y2 }
             );
             
             const isValid = isValidEntitySellMove(
               d,
               { x: entityPosition.x_cur, y: entityPosition.y_cur },
               { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY },
               allowUnilateralIncrement,
               axisLimit
             );
             
             if (isValid) {
               return 2; // 更粗的边框
             }
           }
           return 1;
         })
         .style("cursor", "pointer")
         .style("filter", d => {
           // 为有效目标点添加阴影效果
           if (isVoterAndEntityApplied) {
             const voterMove = calculateVoterMove(
               { x: voterBuy.x1, y: voterBuy.y1 },
               { x: voterBuy.x2, y: voterBuy.y2 }
             );
             
             const isValid = isValidEntitySellMove(
               d,
               { x: entityPosition.x_cur, y: entityPosition.y_cur },
               { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY },
               allowUnilateralIncrement,
               axisLimit
             );
             
             if (isValid) {
               return "drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))"; // 绿色阴影
             }
           }
           return "none";
         })
        .on("mouseover", function(event, d) {
          // 绘制无限延伸的直线
          const x1 = newXScale(0);
          const y1 = newYScale(0);
          const x2 = newXScale(d.x);
          const y2 = newYScale(d.y);
          
          // 计算直线延伸到图表边界的坐标
          const slope = (y2 - y1) / (x2 - x1);
          const width = newXScale(axisLimit) - newXScale(0);
          const height = newYScale(0) - newYScale(axisLimit);
          
          // 计算直线与图表边界的交点
          let extendX1, extendY1, extendX2, extendY2;
          
          if (Math.abs(slope) < height / width) {
            // 直线主要水平延伸
            extendX1 = 0;
            extendY1 = y1 - slope * x1;
            extendX2 = width;
            extendY2 = y1 + slope * (width - x1);
          } else {
            // 直线主要垂直延伸
            extendX1 = x1 - y1 / slope;
            extendY1 = 0;
            extendX2 = x1 + (height - y1) / slope;
            extendY2 = height;
          }
          
          chartContent.append("line")
            .attr("class", "hover-line")
            .attr("x1", extendX1)
            .attr("y1", extendY1)
            .attr("x2", extendX2)
            .attr("y2", extendY2)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);

          // 绘制以(0,0)为中心，半径为C的圆圈
          chartContent.append("circle")
            .attr("class", "hover-circle")
            .attr("cx", newXScale(0))
            .attr("cy", newYScale(0))
            .attr("r", newXScale(d.C) - newXScale(0))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("opacity", 0.8);

          if (isVoterAndEntityApplied) {
            // 完整的工具提示数据（确认应用后）- 使用新的实体卖出逻辑
            const voterMove = calculateVoterMove(
              { x: voterBuy.x1, y: voterBuy.y1 },
              { x: voterBuy.x2, y: voterBuy.y2 }
            );
            
            const isValid = isValidEntitySellMove(
              d, // 实体卖出目标
              { x: entityPosition.x_cur, y: entityPosition.y_cur }, // 当前实体位置
              { deltaX: voterMove.deltaX, deltaY: voterMove.deltaY }, // 投票者持有量
              allowUnilateralIncrement,
              axisLimit
            );
            
            // 计算交易后的投票者持有量
            const entity_deltaX = entityPosition.x_cur - d.x; // 实体释放的X代币
            const entity_deltaY = entityPosition.y_cur - d.y; // 实体释放的Y代币
            const newXHolding = voterMove.deltaX - entity_deltaX; // 交易后X持有量
            const newYHolding = voterMove.deltaY - entity_deltaY; // 交易后Y持有量
            
            // 计算代币变化（实体收益）
            const tokenChange = entityPosition.C_cur - d.C; // C_cur - Ct
            
            // 计算利润（扣除购买成本）
            const profit = entityPosition.C_cur - d.C - voterMove.deltaC; // C_cur - Ct - deltaC

            const tooltipData: TooltipData = {
              x: d.x,
              y: d.y,
              C: d.C,
              Rep: d.Rep,
              voterHoldings: { X: newXHolding, Y: newYHolding },
              tokenEarned: tokenChange,
              profit: profit,
              isValid: isValid && tokenChange > 0
            };

            setTooltip({
              data: tooltipData,
              x: event.pageX,
              y: event.pageY
            });
          } else {
            // 仅基本数据（初始化阶段）
            const tooltipData: TooltipData = {
              x: d.x,
              y: d.y,
              C: d.C,
              Rep: d.Rep,
              voterHoldings: null,
              tokenEarned: null,
              profit: null,
              isValid: null
            };

            setTooltip({
              data: tooltipData,
              x: event.pageX,
              y: event.pageY
            });
          }

           // 高亮点
           d3.select(this)
             .attr("r", 6)
             .attr("stroke-width", 2);
         })
         .on("mouseout", function() {
           setTooltip(null);
           
           // 清除悬停绘制的线条和圆圈
           chartContent.selectAll(".hover-line").remove();
           chartContent.selectAll(".hover-circle").remove();
           
           // 恢复原始样式
           d3.select(this)
             .attr("r", 4)
             .attr("stroke-width", 1);
         });
     }

    // 初始绘制
    updateElements(xScale, yScale);

    // 添加图例
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 200}, 20)`);

    const legendData = [
      { color: "red", label: "Current Entity Reputation" },
      { color: "blue", label: "Buy Start" },
      { color: "#f97316", label: "Buy Target" }, // 橙色
      { color: "#22c55e", label: "Valid Sell Target" }, // 绿色
      { color: "#999999", label: "Regular" }
    ];

    // 添加图例背景 - 使用更智能的定位
    const legendWidth = 180;
    const legendHeight = legendData.length * 20 + 10;
    legend.append("rect")
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "rgba(255, 255, 255, 0.95)")
      .attr("stroke", "#d1d5db")
      .attr("stroke-width", 1)
      .attr("rx", 8)
      .attr("ry", 8)
      .style("backdrop-filter", "blur(4px)");

    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("circle")
        .attr("cx", 6)
        .attr("cy", 0)
        .attr("r", 4)
        .attr("fill", item.color);

      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dy", "0.32em")
        .style("font-size", "12px")
        .text(item.label);
    });

  }, [allTriples, voterBuy, entityPosition, voterMove, allowUnilateralIncrement, isInitialized, isVoterAndEntityApplied, axisLimit, showOversellLimits, showBuyingZones, showPriceCircles]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // 添加窗口大小改变监听器
  useEffect(() => {
    const handleResize = () => {
      renderChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full relative">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Interactive Chart</h2>
            <p className="text-sm text-gray-600">
              Pythagorean Lattice Visualization - Hover for details, use mouse wheel to zoom, drag to pan
            </p>
          </div>
        </div>
        
        {/* Apple-style Toggle Switches */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Oversell Limits</label>
            <button
              onClick={() => setShowOversellLimits(!showOversellLimits)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showOversellLimits ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showOversellLimits ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Buying Zones</label>
            <button
              onClick={() => setShowBuyingZones(!showBuyingZones)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showBuyingZones ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showBuyingZones ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Price Circles</label>
            <button
              onClick={() => setShowPriceCircles(!showPriceCircles)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showPriceCircles ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showPriceCircles ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 h-[calc(100%-80px)]">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">📊</p>
              <p>Please set axis limit and click "Apply" button to initialize chart</p>
            </div>
          </div>
        ) : (
          <div className="h-full chart-container">
            <div className="aspect-square w-full h-full">
              <svg ref={svgRef} className="w-full h-full"></svg>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-black text-white text-sm rounded-lg p-3 pointer-events-none shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-1">
            <div><strong>Coordinates:</strong> ({tooltip.data.x}, {tooltip.data.y})</div>
            <div><strong>C Value:</strong> {Math.round(tooltip.data.C)}</div>
            <div><strong>Reputation:</strong> {(tooltip.data.Rep * 100).toFixed(1)}%</div>
            <div><strong>Balance After Transaction:</strong> {
              tooltip.data.voterHoldings 
                ? `X=${tooltip.data.voterHoldings.X}, Y=${tooltip.data.voterHoldings.Y}`
                : <span className="text-gray-400">N/A</span>
            }</div>
            <div><strong>Token Change:</strong> {
              tooltip.data.tokenEarned !== null 
                ? `${tooltip.data.tokenEarned >= 0 ? '+' : ''}${tooltip.data.tokenEarned.toFixed(2)}`
                : <span className="text-gray-400">N/A</span>
            }</div>
            <div><strong>Profit:</strong> {
              tooltip.data.profit !== null 
                ? `${tooltip.data.profit >= 0 ? '+' : ''}${tooltip.data.profit.toFixed(2)}`
                : <span className="text-gray-400">N/A</span>
            }</div>
            <div><strong>Status:</strong> {
              tooltip.data.isValid !== null
                ? <span className={tooltip.data.isValid ? "text-green-400" : "text-red-400"}>
                    {tooltip.data.isValid ? " ✓ Valid" : " ✗ Invalid"}
                  </span>
                : <span className="text-gray-400"> N/A</span>
            }</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartCanvas;
