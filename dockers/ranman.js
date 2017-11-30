var seedrandom = require('seedrandom');
var fs = require('fs');
var random_seed = 42;
var rng = seedrandom(random_seed);

// randomize the ordering of an array
function randomizer(arr) {
    var currentIndex = arr.length;
    var randomIndex;
    var temporyValue;
    while (0 !== currentIndex) {
        // Pick remaining element
        randomIndex = Math.floor(rng() * currentIndex);
        currentIndex -= 1;

        // swap with current 
        temporaryValue = arr[currentIndex]
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
    }
    return arr;
}


// creates numbered sets of {chunksize} from an array
function groupem(arr, chunksize) {
    var grouped = {}
    var len = arr.length;
    var groupnum = Math.floor(len / chunksize);
    while (groupnum--) {
        var group = []
        grouped[groupnum]
        var cz = chunksize;
        var i = 0;
        while (cz-- > 0) {
            var val = cz + groupnum * chunksize;
            group.push(arr[val])
        }
        grouped[groupnum] = group;
    }
    return grouped;
}

//returns the a randomized, ordered list of datasets 
exports.retData = function() {
    var all;
    var randomized = randomizer(datasets);
    var grouped = groupem(randomized, 10);
    var experiments = [];
    for (group in grouped) {
        var forum = rng().toString(16).substr(2, 8).toLowerCase();
        //need to start with a letter
        experiments.push({
            forum: forum,
            datasets: grouped[group]
        })
    }
    experiments.push({
        forum: 'all',
        datasets: datasets
    })
    //where the magic happens.  order by forum name
    var experiments = experiments.sort(function(a, b) {
        return (a.forum > b.forum) ? 1 : ((b.forum > a.forum) ? -1 : 0);
    })
    for (i in experiments) {
        if (experiments[i]['forum'] == 'all') {
            all = experiments[i]['datasets'];
            delete(experiments[i]);
        }
    }
    //var grouped = experiments;
    var grouped = experiments.slice(0, 2)
    return ({
        grouped: grouped,
        all: all
    });
}
var datasets = ["agaricus-lepiota", "allbp", "allhyper", "allhypo", "allrep", "analcatdata_aids", "analcatdata_asbestos", "analcatdata_authorship", "analcatdata_bankruptcy", "analcatdata_boxing1", "analcatdata_boxing2", "analcatdata_creditscore", "analcatdata_cyyoung8092", "analcatdata_cyyoung9302", "analcatdata_dmft", "analcatdata_fraud", "analcatdata_germangss", "analcatdata_happiness", "analcatdata_japansolvent", "analcatdata_lawsuit", "ann-thyroid", "appendicitis", "australian", "auto", "backache", "balance-scale", "banana", "biomed", "breast", "breast-cancer", "breast-cancer-wisconsin", "breast-w", "buggyCrx", "bupa", "calendarDOW", "car", "car-evaluation", "cars", "cars1", "chess", "churn", "clean1", "cleve", "cleveland", "cleveland-nominal", "cloud", "cmc", "colic", "collins", "confidence", "contraceptive", "corral", "credit-a", "credit-g", "crx", "dermatology", "diabetes", "dis", "ecoli", "flags", "flare", "GAMETES_Epistasis_2-Way_20atts_0.1H_EDM-1_1", "GAMETES_Epistasis_2-Way_20atts_0.4H_EDM-1_1", "GAMETES_Epistasis_3-Way_20atts_0.2H_EDM-1_1", "GAMETES_Heterogeneity_20atts_1600_Het_0.4_0.2_50_EDM-2_001", "GAMETES_Heterogeneity_20atts_1600_Het_0.4_0.2_75_EDM-2_001", "german", "glass", "glass2", "haberman", "hayes-roth", "heart-c", "heart-h", "heart-statlog", "hepatitis", "Hill_Valley_with_noise", "Hill_Valley_without_noise", "horse-colic", "house-votes-84", "hungarian", "hypothyroid", "ionosphere", "iris", "irish", "krkopt", "kr-vs-kp", "labor", "led24", "led7", "letter", "liver-disorder", "lupus", "lymphography", "magic", "mfeat-fourier", "mfeat-karhunen", "mfeat-morphological", "mfeat-zernike", "mofn-3-7-10", "molecular-biology_promoters", "monk1", "monk2", "monk3", "movement_libras", "mushroom", "mux6", "new-thyroid", "nursery", "page-blocks", "parity5", "parity5+5", "pendigits", "phoneme", "pima", "postoperative-patient-data", "prnn_crabs", "prnn_fglass", "prnn_synth", "profb", "promoters", "ring", "saheart", "satimage", "schizo", "segmentation", "solar-flare_1", "solar-flare_2", "sonar", "soybean", "spambase", "spect", "spectf", "splice", "tae", "texture", "threeOf9", "tic-tac-toe", "titanic", "tokyo1", "twonorm", "vehicle", "vote", "vowel", "waveform-21", "waveform-40", "wdbc", "wine-quality-red", "wine-quality-white", "wine-recognition", "xd6", "yeast"];