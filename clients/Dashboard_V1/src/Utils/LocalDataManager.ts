
/*
====================================================================
 ||    Général accessor                                              ||
====================================================================
*/


export const getDataToMemorized = (name:string): string | null => {
  if(localStorage.getItem(name)){
    return localStorage.getItem(name)
  }else{
    console.log('No access token received');
    return null;
  }
};
export const setDataToMemorize = (name:string, data: any): void => {
  removeDataToMemorized(name);
  if( typeof data === 'string'){
   localStorage.setItem(name, data) 
  }else{
    localStorage.setItem(name, JSON.stringify(data)) 
  }
};

export const removeDataToMemorized = (item: string): void => {
  localStorage.removeItem(item);
};