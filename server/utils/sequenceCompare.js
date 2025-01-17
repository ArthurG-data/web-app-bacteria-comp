const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const {initKnex} = require("../setup/knexConfig.js");
const sqlManager = require("../middlewares/sqlManager.js")
const readline = require("readline");
//const { ConfigurationServicePlaceholders } = require('aws-sdk/lib/config_service_placeholders.js');
const code = [ 0, 2, 1, 2, 3, 4, 5, 6, 7, -1, 8, 9, 10, 11, -1, 12, 13, 14, 15, 16, 1, 17, 18, 5, 19, 3 ];
const AA_number = 20;

function encode(ch)
{
    // Calculate the index by subtracting the ASCII value of 'A'
    const index = ch.charCodeAt(0) - 'A'.charCodeAt(0);
    // Return the value from the code array at the calculated index
    return code[index];
}

function countNonZeroEntries(arr) {
    return arr.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0);
}

async function processFileStream(bucketName, key){
    //grab the name of the file
    const knex = await initKnex();
    const response = await sqlManager.getEntryFromFileTable(knex, key);
    const bacteriaName = response.filename;
    console.log("bacteria name:", bacteriaName);
    if (!bacteriaName) {
            throw new Error("Bacteria name not found in the file table");
    }
    //initialise bacteria with vectors of 0
    const bacteriaInstance =new Bacteria(bacteriaName);
    const s3Params = {Bucket: bucketName, Key:key};
    const s3Object = s3.getObject(s3Params);
    //create stream to read the file, and process it by chunk
    const readStream = s3Object.createReadStream();

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity // Handle both \n and \r\n line endings
        });

    rl.on('line', (line) => {
    if (line.startsWith('>')) {
        // Header line, skip it and process any buffered sequence data
        if (bacteriaInstance.sequenceBuffer.length > 0) {
            bacteriaInstance.processSequenceBuffer();
        }
    } else {
        // Append sequence data to the buffer
        bacteriaInstance.sequenceBuffer += line.trim();
    }
});
      return new Promise((resolve, reject)=>{ 
        rl.on('close', () => {
            console.log('Streaming close');
            // Process any remaining buffered data
            if (bacteriaInstance.sequenceBuffer.length > 0) {
                bacteriaInstance.processSequenceBuffer();
            }
            resolve(bacteriaInstance);
        });
        rl.on('error',(err)=>{
           console.log("Error reading the stream:", err);
           reject(err);
});
       });
    }

class Bacteria
{
    constructor(name, len=6, epsilon=1e-10){
        this.len = len;
        this.epsilon = epsilon;
        this.name = name;
        this.initVectors()
    }
    initVectors()
    {
        //k-1 mer frequences
        this.second = [];
        //AA frequences
        this.one_l = [];
        this.indexs = 0;
        this.total = 0;
        this.total_l = 0;
        this.complement = 0;
        //k-mer frequences
        this.vector;
        this.sequenceBuffer = "";

        console.log('Initializing');
        this.M2 = 1;
        for (let i= 0; i<this.len-2;i++)
            {
                this.M2 *= AA_number;
            }
        this.M1 = this.M2 *AA_number;
        this.M = this.M1*AA_number;
        console.log(`Creating Bacteria ${this.name}`)
        this.vector = new Uint16Array(this.M).fill(0);
        this.second = new Uint16Array(this.M1).fill(0);
        this.one_l = new Uint16Array(AA_number).fill(0);
        this.total = 0;
        this.total_l = 0;
        this.complement = 0;
        this.proba = []
        console.log('Vector initialized');
    }

    init_buffer(buffer)
    {
        this.complement++;
        this.indexs = 0;
        for (let i=0; i<this.len-1;i++)
            {
                let enc = encode(buffer[i]);
                this.one_l[enc]++;
                this.total_l++;
                this.indexs = this.indexs * AA_number + enc;
            }
        this.second[this.indexs]++;
    }
    cont_buffer(ch)
    {
        let enc = encode(ch);
        this.one_l[enc]++;
        this.total_l++;
        let index = this.indexs * AA_number + enc;
        this.vector[index]++;
        this.total++;
        this.indexs = (this.indexs % this.M2 * AA_number + enc);
        this.second[this.indexs]++;
    }
    processSequenceBuffer(){
        const sequence = this.sequenceBuffer;
        if (sequence.length >= this.len){
            //initialize the buffer on the first 5
	    this.init_buffer(sequence.slice(0,this.len-1))
            for (let i = this.len-1;i <sequence.length;i++){
                //slid the window until the end of the sequence
                this.cont_buffer(sequence[i])
            }
        } else {
        console.log("Sequence is too short")
    }
    this.sequenceBuffer = '';
    }


    stochastic_compute(i)
    {
        let p1 = this.second[Math.floor(i/AA_number)]/ (this.total+this.complement);
        let p2 = this.one_l[i % AA_number] / this.total_l;
        let p3 = this.second[i%this.M1]/(this.total+this.complement);
        let p4 = this.one_l[Math.floor(i/this.M1)] / this.total_l;   
        return this.total * (p1*p2 + p3*p4) /2;
    }
}

async function computeCorrelation(bacteria1, bacteria2) {
    let vector_len1 = 0;
    let vector_len2 = 0;
    let correlation = 0;
    let M = bacteria1.M;
    let epsilon = bacteria1.epsilon;
    const batchSize = 100;
   
    console.log(`Comparing ${bacteria1.name} and ${bacteria2.name}:`);

    for (let batchStart = 0; batchStart < M; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, M);
        const promises = Array.from({ length: batchEnd - batchStart }, (_, i) => {
            const index = batchStart + i;
            return Promise.all([
                bacteria1.stochastic_compute(index),
                bacteria2.stochastic_compute(index)
            ]).then(([stochastic1, stochastic2]) => {
                let t1 = 0;
                let t2 = 0;
                if (stochastic1 > epsilon) {
                    t1 = (bacteria1.vector[index] - stochastic1) / stochastic1;
                }
                if (stochastic2 > epsilon) {
                    t2 = (bacteria2.vector[index] - stochastic2) / stochastic2;
                }
                vector_len1 += t1 * t1;
                vector_len2 += t2 * t2;
                correlation += t1 * t2;
            });
        });

        // Wait for current batch of promises to resolve before proceeding
        await Promise.all(promises);
    }
    result_correlation = correlation / (Math.sqrt(vector_len1) * Math.sqrt(vector_len2));
    console.log(`${bacteria1.name} ${bacteria2.name} -> ${result_correlation.toFixed(10)}`)
    return  result_correlation.toFixed(10);
}

module.exports = 
{
    processFileStream,
    computeCorrelation
};

