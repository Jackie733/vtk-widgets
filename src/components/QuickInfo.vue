<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import { useCurrentImage } from '../composables/useCurrentImage';
import { useDICOMStore } from '../store/dicom';
import { isDicomImage } from '../utils/dataSelection';

const op = ref();

const toggle = (event: Event) => {
  op.value.toggle(event);
};

const { currentImageID } = useCurrentImage();
const dicomStore = useDICOMStore();
const dicomInfo = computed(() => {
  const volumeKey = currentImageID.value;
  if (volumeKey && isDicomImage(volumeKey)) {
    const volumeInfo = dicomStore.volumeInfo[volumeKey];
    const studyKey = dicomStore.volumeStudy[volumeKey];
    const studyInfo = dicomStore.studyInfo[studyKey];
    const patientKey = dicomStore.studyPatient[studyKey];
    const patientInfo = dicomStore.patientInfo[patientKey];

    const patientID = patientInfo.PatientID;
    const studyID = studyInfo.StudyID;
    const studyDescription = studyInfo.StudyDescription;
    const seriesNumber = volumeInfo.SeriesNumber;
    const seriesDescription = volumeInfo.SeriesDescription;

    return {
      patientID,
      studyID,
      studyDescription,
      seriesNumber,
      seriesDescription,
    };
  }
  return null;
});
</script>

<template>
  <div class="card flex justify-center">
    <Button
      size="small"
      severity="secondary"
      icon="pi pi-info"
      rounded
      aria-label="Info"
      @click="toggle"
    />
    <Popover ref="op">
      <div class="flex flex-col gap-4 w-[20rem]">
        <div>
          <span class="block mb-2">PATIENT / CASE</span>
          <ul class="list-none p-0 m-0 text-small">
            <li class="bg-gray-700">ID: {{ dicomInfo?.patientID }}</li>
          </ul>
        </div>
        <div>
          <span class="block mb-2">STUDY</span>
          <ul class="list-none p-0 m-0 text-small">
            <li class="bg-gray-700">ID: {{ dicomInfo?.studyID }}</li>
            <li class="bg-gray-700">{{ dicomInfo?.studyDescription }}</li>
          </ul>
        </div>
        <div>
          <span class="block mb-2">SERIES</span>
          <ul class="list-none p-0 m-0 text-small">
            <li class="bg-gray-700">Series #: {{ dicomInfo?.seriesNumber }}</li>
            <li class="bg-gray-700">{{ dicomInfo?.seriesDescription }}</li>
          </ul>
        </div>
      </div>
    </Popover>
  </div>
</template>
