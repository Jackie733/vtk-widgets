# 工具开发

工具允许用户与场景对象互动，并通过点击、拖动和触摸来驱动功能。

## 工具架构

### 工具管理器

`vtkWidgetManager`是管理视图中工具的创建/销毁/焦点的对象。 每个渲染器只有一个`vtkWidgetManager`。工具管理器和渲染器应以编程方式实例化，并与 widgetManager.setRenderer(renderer)) 链接。渲染器和小部件管理器之间的链接应在任何其他操作之前设置。
