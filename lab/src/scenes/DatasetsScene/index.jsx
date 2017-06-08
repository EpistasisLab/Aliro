import React from 'react';
import SceneWrapper from '../../components/SceneWrapper';
import Datasets from '../../components/Datasets';

const DatasetsScene = () => (
	<SceneWrapper 
		headerContent="Datasets"
		btnContent="Add new"
		btnIcon="plus"
	>
		<Datasets />
	</SceneWrapper>
);

export default DatasetsScene;