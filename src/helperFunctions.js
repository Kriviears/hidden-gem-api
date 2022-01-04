const filterGems = (range, source, loc)=>{
    if(source >= loc-range || source <= loc+range){
        return source
    } else return false
}


const generateRange = (number, distance=5)=>{
    let range = [];

    for(let i=-distance; i<0; i++){
        range.push(number+i);
    }
    
    for(let i=0; i<=distance; i++){
        range.push(number+i)
    }
    
    return range
}


const rating = (gem)=>{
    const total = gem.likes.length + gem.dislikes.length;
    return ((gem.likes.length / total) * 100)
}


module.exports = {generateRange}