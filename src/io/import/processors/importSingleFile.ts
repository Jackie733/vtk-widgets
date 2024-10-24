import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import { useImageStore } from '@/src/store/images';
import { FILE_READERS } from '@/src/io';
import { ImportHandler } from '@/src/io/import/common';
import { DataSourceWithFile } from '@/src/io/import/dataSource';
import { useFileStore } from '@/src/store/files';
import { useViewStore } from '@/src/store/views';
import { InitViewSpecs } from '@/src/config';
import { getLPSAxisFromDir } from '@/src/utils/lps';
import { useViewSliceStore } from '@/src/store/view-configs/slicing';

/**
 * Reads and imports a file DataSource.
 * @param dataSource
 * @returns
 */
const importSingleFile: ImportHandler = async (dataSource, { done }) => {
  if (!dataSource.fileSrc) {
    return dataSource;
  }

  const { fileSrc } = dataSource;
  if (!FILE_READERS.has(fileSrc.fileType)) {
    return dataSource;
  }

  const reader = FILE_READERS.get(fileSrc.fileType)!;
  const dataObject = await reader(fileSrc.file);

  const fileStore = useFileStore();

  if (dataObject.isA('vtkImageData')) {
    const dataID = useImageStore().addVTKImageData(
      fileSrc.file.name,
      dataObject as vtkImageData
    );
    fileStore.add(dataID, [dataSource as DataSourceWithFile]);

    useViewStore().viewIDs.forEach((viewID: string) => {
      const { lpsOrientation, dimensions } = useImageStore().metadata[dataID];
      const axisDir = InitViewSpecs[viewID].props.viewDirection;
      const lpsFromDir = getLPSAxisFromDir(axisDir);
      const lpsOrient = lpsOrientation[lpsFromDir];

      const dimMax = dimensions[lpsOrient];

      useViewSliceStore().updateConfig(viewID, dataID, {
        axisDirection: axisDir,
        max: dimMax - 1,
      });
      useViewSliceStore().resetSlice(viewID, dataID);
    });

    return done({
      dataID,
      dataSource,
      dataType: 'image',
    });
  }

  // if (dataObject.isA('vtkPolyData')) {
  //   if (!useDatasetStore().primarySelection) {
  //     useMessageStore().addWarning(
  //       'Load an image to see the mesh. Initializing viewports from mesh files is not implemented.'
  //     );
  //   }
  //   const dataID = useModelStore().addVTKPolyData(
  //     fileSrc.file.name,
  //     dataObject as vtkPolyData
  //   );
  //   fileStore.add(dataID, [dataSource as DataSourceWithFile]);

  //   return done({
  //     dataID,
  //     dataSource,
  //     dataType: 'model',
  //   });
  // }

  throw new Error('Data reader did not produce a valid dataset');
};

export default importSingleFile;
