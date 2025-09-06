# 快速开始指南

## 环境要求
- Node.js 16+ 
- npm 或 yarn

## 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm start
```

3. **在浏览器中访问**
```
http://localhost:3000
```

## 故障排除

### TypeScript 编译错误
如果遇到 D3 类型定义错误，可以忽略，应用仍能正常运行。这是由于某些 D3 类型定义版本兼容性问题导致的。

### 依赖问题
如果遇到依赖冲突，可以清理并重新安装：

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

**macOS/Linux:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### 构建问题
如果启动失败，尝试：
```bash
npm run build
```

## 使用说明

1. **初始设置**: 设置轴限制并点击"应用"按钮
2. **配置参数**: 在设置面板中配置投票者购买和实体位置
3. **应用设置**: 点击"确认 + 应用"按钮更新图表和分析
4. **交互探索**: 在图表中悬停查看详细信息
5. **分析结果**: 在右侧面板查看有效目标点和统计信息

## 功能特点

✅ 完整的三列布局设计
✅ 交互式D3.js散点图
✅ 实时毕达哥拉斯三元组计算
✅ 声誉值和代币成本分析
✅ 约束验证和有效性检查
✅ 随机化功能便于测试
✅ 响应式设计支持移动设备
✅ 悬停提示显示详细信息
✅ 统计分析和结果排序

