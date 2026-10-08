import modelBaseUrl from '../../cache/models/model_0.onnx';
import modelTypeUrl from '../../cache/models/model_1.onnx';
import modelTimeUrl from '../../cache/models/model_2.onnx';

import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = {
    'ort-wasm-simd.wasm': '/wasm/ort-wasm-simd.wasm',
    'ort-wasm.wasm': '/wasm/ort-wasm.wasm',
};

ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;

const [baseBuf, typeBuf, timeBuf] = await Promise.all([
    fetch(modelBaseUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to load ${modelBaseUrl}`);
        return res.arrayBuffer();
    }),

    fetch(modelTypeUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to load ${modelTypeUrl}`);
        return res.arrayBuffer();
    }),

    fetch(modelTimeUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to load ${modelTimeUrl}`);
        return res.arrayBuffer();
    }),
]);

const sessionOptions = { executionProviders: ['wasm'] };

const baseSession = await ort.InferenceSession.create(baseBuf, sessionOptions);
const typeSession = await ort.InferenceSession.create(typeBuf, sessionOptions);
const timeSession = await ort.InferenceSession.create(timeBuf, sessionOptions);

const sessions = { baseSession, typeSession, timeSession };
const max_bases = 16;
const num_features = 2 + 5 * max_bases;

function prepareData(data) {
    let cleaned_data = structuredClone(data);

    cleaned_data.previous_attack.name = cleaned_data.previous_attack.name.trim();

    cleaned_data.base_data.map(item => {
        const { parsed_info, _ } = parseBaseInfo(item.bases);

        item.name = item.name.trim();
        item.bases = parsed_info;

        return item;
    });

    return cleaned_data;
}

function checkDataIntegrity(data) {
    let check_status = true;
    let feedback = [];

    if (data.previous_attack.name.trim() === '') {
        check_status = false;
        feedback.push('Name of the last attacked base missing.');
    } else {
        const base_names = data.base_data.map(item => item.name.trim());

        check_status = base_names.includes(data.previous_attack.name.trim());

        if (!check_status) {
            feedback.push(
                `Previous attack on Base: ${
                    data.previous_attack.name
                } not among list of bases: ${base_names.join(', ')}`
            );
        }
    }

    data.base_data.forEach((item, index) => {
        if (item.name.trim() === '') {
            check_status = false;
            feedback.push(`Name of Base ${index} is missing.`);
        }

        const { _, error } = parseBaseInfo(item.bases);

        if (error) {
            check_status = false;
            feedback.push(
                `Incorrectly formatted neighborhood information for Base ${index}. ${error.message}.`
            );
        }
    });

    return { check_status, feedback };
}

function baseInfoFeatures(base_info) {
    return Array.from({ length: num_features }, () =>
        Math.round(Math.random())
    );
}

function parseBaseInfo(base_info_str) {
    let parsed_info = [];
    let error = null;

    try {
        let str_split = base_info_str
            .trim()
            .split(',')
            .map(item => item.trim());

        str_split.forEach(item => {
            if (item !== '') {
                const item_split = item.split('x').map(item => item.trim());
                const how_many = Number(item_split[0]);
                const level = Number(item_split[1]);

                if (Number.isNaN(how_many) || Number.isNaN(level)) {
                    const message = `Could not parse neighborhood information for Base ${index}`;

                    error = { message };
                    return { parsed_info, error };
                }

                parsed_info.push({ how_many, level });
            }
        });

        return { parsed_info, error };
    } catch (error) {
        return { parsed_info, error };
    }
}

// AI-generated
async function makePrediction(featureVector, topK = 3) {
    const inputTensor = new ort.Tensor(
        'float32',
        Float32Array.from(featureVector),
        [1, featureVector.length]
    );

    // Dynamic input node names from ONNX session
    const baseInputName = sessions.baseSession.inputNames[0];
    const typeInputName = sessions.typeSession.inputNames[0];
    const timeInputName = sessions.timeSession.inputNames[0];

    // Run inference
    const resBase = await sessions.baseSession.run({
        [baseInputName]: inputTensor,
    });

    const resType = await sessions.typeSession.run({
        [typeInputName]: inputTensor,
    });

    const resTime = await sessions.timeSession.run({
        [timeInputName]: inputTensor,
    });

    // Extract raw probability arrays (zipmap: False outputs dense tensor at index 1)
    const baseProbs = Array.from(
        resBase[sessions.baseSession.outputNames[1]].data
    );

    const typeProbs = Array.from(
        resType[sessions.typeSession.outputNames[1]].data
    );

    const estimatedTime = resTime[sessions.timeSession.outputNames[0]].data[0];

    // Compute Top-K bases
    const rankedBases = baseProbs
        .map((prob, id) => ({ baseId: id, probability: prob }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, topK);

    const enemyTypes = ['Camp', 'Outpost', 'Base'];
    const maxTypeIndex = typeProbs.indexOf(Math.max(...typeProbs));

    const prediction = {
        topKBases: rankedBases,
        estimatedTimeSeconds: Math.max(0, estimatedTime),
        likelyEnemyType: enemyTypes[maxTypeIndex],
    };

    return prediction;
}

export {
    makePrediction,
    parseBaseInfo,
    baseInfoFeatures,
    checkDataIntegrity,
    prepareData,
};
