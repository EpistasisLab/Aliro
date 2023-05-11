import React,{useContext} from 'react';
import { ThemeContext } from './context/ThemeContext';

import TestContent from './TestContent';


const TestPage = () => {
    const {isDark, setIsDark, currentModel,setCurrentModel,experiment_data_id} = useContext(ThemeContext);
    console.log("testpage-isDark: ",isDark);
    // console.log("testpage-setIsDark: ",setIsDark);
    console.log("testpage-currentModel: ",currentModel);

    console.log("testpage-experiment_data_id: ",experiment_data_id)


    return (
        <div>
            <ThemeContext.Provider value={{isDark, setIsDark, currentModel,setCurrentModel}}>
                <TestContent />
            </ThemeContext.Provider>
        </div>
    )
}


export default TestPage;