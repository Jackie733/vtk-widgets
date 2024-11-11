# widget 开发

widget 允许用户与场景对象互动，并通过点击、拖动和触摸来驱动功能。

## 名词解释

角色：actor
映射器：mapper
渲染器：renderer
表征：representation
子状态：sub-state
查找表[LUT]：lookup table
操纵器：manipulator
交互器：interactor
过滤器：filter

## widget 架构

### widget 管理器

`vtkWidgetManager`是管理视图中 widget 的创建/销毁/焦点的对象。 每个渲染器只有一个`vtkWidgetManager`。widget 管理器和渲染器(renderer)应以编程方式实例化，并与 widgetManager.setRenderer(renderer)) 链接。渲染器(renderer)和 widget 管理器之间的链接应在任何其他操作之前设置。

每个 widget 管理器在任何给定时间内最多只能将焦点赋予一个工具。焦点定义了哪个 widget 处于活动状态并应处理事件。请注意，在没有焦点的情况下，仍有可能响应事件（请参阅 "**widget 行为**"）。使用 `widgetManager.grabFocus(widget)` 将焦点赋予 widget。调用 `widgetManager.enablePicking()` 允许用户与 widget 进行交互。如果有的话，它会释放先前持有的 widget 的焦点。

### 创建 widget

widget 由 `vtkWidget.newInstance(INITIAL_VALUES)` 创建，其中 `vtkWidget` 是正在创建的 widget 的基类，`INITIAL_VALUES` 是给予 widget 构造函数的参数。请注意，某些参数以后无法更改。`INITIAL_VALUES` 可能是设置这些参数的唯一方法。在此调用期间，将创建“widget 状态”。它对于 widget 实例是唯一的。这允许在渲染器(renderer)之间同步同一个 widget（一个视图中 widget 状态的更改会直接在所有其他视图中渲染）。

然后，必须用 `widgetManager.addWidget(widget, viewType)` 设置 widget。 `viewType` 参数会告知 widget 管理器它应该构建的表征（请参阅 **widget 表征**）。 `addWidget()` 返回一个 `handle` 到 widget 管理器所链接的渲染器(renderer)的特定 widget。

一个 widget 可以添加到多个 widget 管理器中。每个 widget 管理器都会为其特定的渲染器(renderer)返回一个 handle 。

### 终止 widget

通过 widgetManager.removeWidget(widget) 可以从视图中移除部件。从 widget 管理器中移除 widget 的同时，也会移除它的所有表征，widget 将无法再接收事件。一旦一个 widget 从所有 widget 管理器中移除，就可以通过 widget.delete() 安全地删除它。在从所有 widget 管理器中删除部件之前删除它，会导致一些问题，因为这些管理器仍会尝试使用它。

### widget 状态

widget 状态存储的是跨渲染器(renderer)使用的 widget 数据。widget 状态由描述 widget 特定方面的属性组成的子状态（即对象）构成。例如，子状态可以存储要呈现的角色的位置和大小。

widget 状态必须使用 `vtkStateBuilder` 构建。有四种构建子状态的方法。

#### 静态子状态

第一种构建子状态的方法是

```js
.addStateFromMixin({
  labels: ['{LABEL0}'],
  mixins: ['origin', 'scale1', 'visible'],
  name: '{NAME}',
  initialValues: {
    scale1: 0.1,
    origin: [1, 2, 3],
    visible: false
  }
})

```

**`name`** 是子状态的唯一标识。它用于通过调用 `state.get{NAME}()` 获取子状态。

**`labels`** 数组决定了哪些表征可以使用该子状态进行渲染（请参阅 "widget 表征"）。一个子状态可以有多个 `labels` ，因此可以同时被多个表征使用。这样就可以通过使用多个简单且可重复使用的表征来呈现复杂的 widget，而不是每个 widget 使用一个复杂的表征。

**`mixins`** 是存储子状态有用数据的字段。由于 `mixins` 旨在供表示用于渲染目的，因此它们是标准化的，并且在选择上受到限制。可以在 `StateBuilder` 中找到完整的 `mixins` 列表。

可通过 `subState.get{NAME}()` 和 `subState.set{NAME}()` 访问存储在子状态中的值

修改子状态会触发场景渲染。

最后， **`initalValues`** 是子状态创建时的内容。因为 `mixins` 已经定义了默认值，所以没有必要全部指定。

#### 动态子状态

动态子状态是可调整大小的子状态数组。可以即时添加和删除子状态。例如，如果用户选择了一组点，每添加一个点，该点的位置就会添加到 widget 状态中）。动态子状态如下创建：

```js
.addDynamicMixinState({
  labels: ['{LABEL0}', '{LABEL1}'],
  mixins: ['origin', 'color', 'scale1', 'visible'],
  name: '{NAME}',
  initialValues: {
    scale1: 0.05,
    origin: [-1, -1, -1],
    visible: false,
  },
})
```

子状态通过 `state.add{NAME}()` 添加，并返回一个指向新创建子状态的`handle`。
子状态通过 `state.remove{NAME}(handle)` 删除，其中`handle`是 `add{NAME}` 给出的`handle`。
可以通过调用 `state.get{NAME}List()` 获取子状态。
可通过 `state.clear{NAME}List()` 清除子状态列表。

#### 预存子状态

预存子状态是将一个预存子状态添加到 widget 状态中。这些状态如下添加：

```js
.addStateFromInstance({
  labels: ['{LABEL0}', '{LABEL1}'],
  name: '{NAME}',
  instance
})
```

#### 其他子状态

最后，还可以通过 `state.addField({ name, initialValue })` 创建其他子状态。这样就可以存储不限于 `mixin` 列表的数据，但这些数据不会传递给表征进行渲染。它们允许创建更复杂的 widget 状态。

widget 状态是之前子状态的累加。这些状态可以简单地通过链式调用 `stateBuilder.add{...}` 来建立：

```js
vtkStateBuilder
  .createBuilder()
  .addStateFromMixin({})
  .addDynamicMixinState({})
  .addDynamicMixinState({})
  .build();
```

#### Mixins

##### boundsMixin

该 mixin 添加了属性 `bounds` 和 `placeFactor` 以及方法 `containPoint`, `placeWidget`, `setPlaceFactor`

##### colorMixin

此 mixin 添加了一个颜色属性。这是一个介于 0 和 1 之间的标量值，用于确定许多 `HandleRepresentation` 的颜色，例如 `SphereHandleRepresentation` 和 `CircleContextRepresentation`。在确定最终颜色时，该标量值通过内部使用的映射器上的查找表 (LUT) 进行映射。

为了实现自定义 RGB 颜色，需要修改查找表。对于 `SphereHandleRepresentation` 和 `CircleContextRepresentation`，您可以调用 `.getMapper().getLookupTable()` 获取内部 LUT 的引用。

##### directionMixin

这个 mixin 添加了一个 `direction` 属性和 `rotateFromDirections` 方法、`rotate` 和 `rotate[X/Y/Z]` 。

##### manipulatorMixin

此 mixin 为一个状态添加一个操纵器。

##### nameMixin

这个 mixin 添加一个`name`属性。

##### orientationMixin

该 mixin 添加了 `up` 、 `right` 和 `direction` 属性，以描述一个状态的方向。

##### originMixin

这个 mixin 添加一个`origin`属性。

##### scale1Mixin 和 scale3Mixin

这些 mixin 分别添加了单比例因子和三比例因子。

如果将 mixin 的 `scaleInPixels` 设置为 `true`，则 `scale1` 将被解释为表征的像素高度。（仅适用于支持此功能的表示；搜索 scaleInPixels 以查看哪些表示支持此功能。）
这意味着，无论表示在世界空间中的什么位置，它的高度总是约为 scale1 像素。

##### visibleMixin

这个 mixin 添加一个 `visible` 标记。

### widget 表征

widget 表征是 widget 的可视部分。widget 可以使用多种表征（例如，用线连接的点）。当通过调用 `getRepresentationsForViewType(viewType)` 将 widget 添加到 widget 管理器时，就可以选择 widget 使用的表征，其中 `viewType` 是 `widgetManager.addWidget(...)` 参数中给出的视图类型。该方法应返回一个数组，如下所示

```js
switch (viewType) {
  case ViewTypes.DEFAULT:
  case ViewTypes.GEOMETRY:
  case ViewTypes.SLICE:
    return [
      {
        builder: vtkCircleContextRepresentation,
        labels: ['handle', 'trail'],
      },
      {
        builder: vtkPolyLineRepresentation,
        labels: ['trail'],
      },
    ];
  case ViewTypes.VOLUME:
  default:
    return [{ builder: vtkSphereHandleRepresentation, labels: ['handle'] }];
}
```

`builder`字段是 widget 使用的表征类。`labels` 字段决定了表征应使用 widget 的哪些子状态。一个表征可以有多个子状态作为输入。不同的子状态可以以类似的方式呈现。为不同的视图类型返回不同的表示参数，可以根据具体情况调整视图。例如，在二维视图和三维视图中同时渲染一个部件，并使用不同的二维和三维部件表示法。

当子状态被修改时，表征会自动重新计算。它们是作为 VTK.js 过滤器实现的，因为所有的渲染计算都发生在`requestData(inData, outData)` 方法中，其中 `inData` 是来自子状态的状态列表，而 `outData` 是代表要渲染的几何体的 `vtkPolyData` 。

表征管理自己的角色和映射器。角色通常在创建表征时创建。角色应在 `model.actors` 中推送以进行呈现（请参阅 `vtkRectangleContextRepresentation`，了解一个简单的示例）。

表征应继承自 `vtkHandleRepresentation` 或 `vtkContextRepresentation` 。这两个基类的区别在于，用户可以点击并与 handle 表征交互，但不能与 context 表征交互。

### widget 行为

widget 行为是 widget 逻辑发生的地方。当一个 widget 被添加到 widget 管理器时，widget 行为就是返回的`handle`。widget 行为通过处理程序方法接收并响应鼠标和键盘事件。这些方法被命名为 `handle{XXX}(callData)` ，其中 `XXX` 是事件名称（如 `KeyPress` , `KeyUp` , `MouseMove` , `LeftButtonPress` 等......）， `callData` 是事件数据（包含鼠标位置、键盘状态等信息......）。所有事件都不需要处理方法：如果没有提供处理方法，widget 行为将忽略该事件。每个处理程序必须返回 `macro.EVENT_ABORT` 或 `macro.VOID` 。 `macro.EVENT_ABORT` 表示该事件不应传播给其他 widget，而 `macro.VOID` 表示该事件应被传播。请注意，widget 接收事件的顺序是无法保证的，因此返回错误的值可能会使其他 widget 无法接收它们期望的事件。

widget 行为还可以访问渲染器、`openGLRenderWindow` 和交互器。

#### 复杂 widget 交互

##### 焦点

作为一个 widget 概念，"焦点"意味着特定的 widget 应该是唯一可交互的 widget。当有一个主要 widget 时，就会出现这种用例。

例如，画笔 widget 需要焦点，因为当它处于激活状态时，就不可能移动标尺、十字准线等。widget 管理器应只允许画笔状态处于活动状态，而不允许激活任何其他状态。

当一个 widget 被赋予焦点时，widget 行为会通过 `grabFocus()` 方法得到通知。这通常是设置复杂交互状态的地方，例如初始化 widget 行为的内部状态（有别于 widget 状态）、启动动画（请参阅动画）或设置活动状态（请参阅活动状态）。

当 widget 管理器从 widget 移除焦点时，会调用 `loseFocus()` 方法。如有必要，也可由 widget 行为本身调用。例如，一个 widget 可能会在按下 `Escape` 键后决定失去焦点。

##### 活动状态

widget 状态可以有一个活动子状态。这通常用于标记用户正在与之交互的`handle`，并对其进行跟踪或改变其视觉外观。例如， `vtkSphereHandleRepresentation` 会暂时增加活动`handle`的半径，以突出活动`handle`。

widget 状态可以通过使用 `subState.activate()` 来设置。同样，调用 `subState.deactivate()` 可以停用子状态。

当 widget 没有焦点时，如果用户悬停一个`handle`，就可以激活一个子状态。活动`handle`的指针存储在 `model.activeState` 中。这样就可以在 widget 没有焦点时进行交互。

为了保持一致，当焦点 widget 设置活动状态时， `model.activeState` 成员也会被设置为指向活动`handle`。

##### 动画

widget 可以请求动画。动画会告诉 vtk.js 在必要时重新渲染。由于 widget 可以通过调用 `model.interactor.render()` 来触发渲染，因此动画并不是必需的，只有当你不想考虑渲染时动画才有用。widget 通过调用 `model.interactor.startAnimation(publicAPI)` 开始动画，并通过调用 `model.interactor.cancelAnimation(publicAPI)` 停止动画。

### 代码架构

每个 widget 都有自己的目录，该目录下有三个文件：

- state.js
- behavior.js
- index.js

> 请注意，小部件的所有代码可能都在 index.js 中，但架构概念是一样的。

#### state.js

state.js 文件包含状态构建函数，通常看起来像这样：

```js
export default function generateState() {
  return vtkStateBuilder
    .createBuilder()
    .addStateFromMixin({ ... })
    .addDynamicMixinState({ ... })
    .build();
}
```

该函数随后会在 index.js 中使用，以实际构建 widget 状态。

#### behavior.js

behavior.js 文件定义了 widget 行为的方法，通常看起来像这样：

```js
export default function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push('vtk{NAME}WidgetProp');

  publicAPI.handle{XXX} = () => {...}

  publicAPI.grabFocus = () => {...}
  publicAPI.loseFocus = () => {...}
}
```

#### index.js

index.js 文件包含 widget 的定义，并将所有部分粘合在一起。widget 定义是一个普通的 vtk.js 类。widget 行为通过设置成员 `model.behavior = widgetBehavior` 进行设置。widget 状态是通过设置成员 `model.widgetState = stateGenerator()` 来建立的。**应该在这个文件中实现`getRepresentationsForViewType` 方法**。数组 `model.methodsToLink` 中的字符串描述了 vtk.js 应创建的方法名称，这些方法可直接与表示法接口。例如，如果 `'{NAME}'` 位于 `model.methodsToLink` 中，vtk.js 就会在 widget 行为中添加 `set{NAME}()` 和 `get{NAME}()` 方法。这些方法会在内部调用暴露它们的每个表示法的相同方法。
