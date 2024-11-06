import { vtkSubscription } from '@kitware/vtk.js/interfaces';
import {
  IAnnotationToolWidgetInitialValues,
  vtkAnnotationToolWidget,
  vtkAnnotationWidgetPointState,
  vtkAnnotationWidgetState,
} from '../ToolWidgetUtils/types';
import vtkAbstractWidgetFactory from '@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory';

export interface vtkPolygonWidgetPointState
  extends vtkAnnotationWidgetPointState {}

export interface vtkPolygonWidgetState extends vtkAnnotationWidgetState {
  getMoveHandle(): any;
  clearHandles(): void;
  getPlacing(): boolean;
  setPlacing(is: boolean): void;
  getFinishable(): boolean;
  setFinishable(is: boolean): void;
}

export interface vtkPolygonViewWidget extends vtkAnnotationToolWidget {
  getWidgetState(): vtkPolygonWidgetState;
  onDraggingEvent(callback: (e: any) => void): vtkSubscription;
}

export interface IPolygonWidgetInitialValues
  extends IAnnotationToolWidgetInitialValues {}

export interface vtkPolygonWidget
  extends vtkAbstractWidgetFactory<vtkPolygonViewWidget> {
  getLength(): number;
  getWidgetState(): vtkPolygonWidgetState;
}

function newInstance(
  initialValues: IPolygonWidgetInitialValues
): vtkPolygonWidget;

export declare const vtkPolygonWidget: {
  newInstance: typeof newInstance;
};
export default vtkPolygonWidget;
