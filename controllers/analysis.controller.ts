import { ChatOpenAI } from "langchain/chat_models/openai";
import { createTaggingChain } from "langchain/chains";
import dotenv from 'dotenv';
import { Review } from "../db/models/review.model";
import { Tags } from "../db/models/tag.model";
import { _Request } from "../db/models/request.model";


dotenv.config();

const chatModel = new ChatOpenAI({ temperature: 0, openAIApiKey: process.env.OpenAI_API });



/**
 * Generating Tags and sentimetal analysis for the Batch of reviews 
 * and saving back to mongoDB
 */
export async function GenerateTags(event: any, reques_id: string) {
    try {
        const process_id = event.process_id
        console.log('Generating tags', 'processid:', process_id)
        const chain = createTaggingChain(Tagslangchainschema, chatModel);
        let tags: any = {
            positivePricingLabels: [],
            negativePricingLabels: [],
            positiveDeliveryLabels: [],
            negativeDeliveryLabels: [],
            postiveProductFeatureLabels: [],
            negativeProductFeatureLabels: [],
            positivePackagingLabels: [],
            negativePackagingLabels: [],
        }
        const reviews = await Review.aggregate([
            {
                $match: { process_id: process_id },
            },
            {
                $project: { _id: 0, reviewText: { $ifNull: ["$reviewText", "$title"] } },
            }
        ])
        const reviewPromises = reviews.map(async (review: any, index: number) => {
            return new Promise<void>(async (resolve) => {
                try {
                    let result: any = await chain.run(review.reviewText)
                    if (result.positivePricingLabels) {
                        tags.positivePricingLabels = [...tags.positivePricingLabels, ...result.positivePricingLabels]
                    }
                    if (result.negativePricingLabels) {
                        tags.negativePricingLabels = [...tags.negativePricingLabels, ...result.negativePricingLabels]
                    }
                    if (result.positiveDeliveryLabels) {
                        tags.positiveDeliveryLabels = [...tags.positiveDeliveryLabels, ...result.positiveDeliveryLabels]
                    }
                    if (result.negativeDeliveryLabels) {
                        tags.negativeDeliveryLabels = [...tags.negativeDeliveryLabels, ...result.negativeDeliveryLabels]
                    }
                    if (result.postiveProductFeatureLabels) {
                        tags.postiveProductFeatureLabels = [...tags.postiveProductFeatureLabels, ...result.postiveProductFeatureLabels]
                    }
                    if (result.negativeProductFeatureLabels) {
                        tags.negativeProductFeatureLabels = [...tags.negativeProductFeatureLabels, ...result.negativeProductFeatureLabels]
                    }
                    if (result.positivePackagingLabels) {
                        tags.positivePackagingLabels = [...tags.positivePackagingLabels, ...result.positivePackagingLabels]
                    }
                    if (result.negativePackagingLabels) {
                        tags.negativePackagingLabels = [...tags.negativePackagingLabels, ...result.negativePackagingLabels]
                    }
                    resolve()
                } catch (error) {
                    console.log(`error at index: ${index}`)
                    console.log(review)
                    console.error(error)
                    resolve()
                }
            })
        })
        await Promise.all(reviewPromises)
        await Tags.create({ ...tags, ...{ request_id: reques_id, process_id: event.process_id } }).then((result) => {
            console.log('Tag Document created successfully:');
            // AnalyseReviews(event)
        }).catch((error) => {
            console.error(error)
        })
        return null
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function AnalyseReviews(event: any) {
    try {
        console.log('Analysing starts')
        const properties = {
            sentiment: { type: "string" },
            tone: { type: "string" },
            language: {
                type: "string",
                // enum: ["english", "french", "spanish", "arabic"],
            },
            pros: {
                type: "array",
                items: { type: "string" },
                description: "Pros of this product",
            },
            cons: {
                type: "array",
                items: { type: "string" },
                description: "Cons of this product",
            },
            rating: { type: "number" },
            positivePricingLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.positivePricingLabels,
                },
            },
            negativePricingLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.negativePricingLabels,
                },
            },
            positiveDeliveryLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.positiveDeliveryLabels,
                },
            },
            negativeDeliveryLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.negativeDeliveryLabels,
                },
            },
            postiveProductFeatureLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.postiveProductFeatureLabels,
                },
            },
            negativeProductFeatureLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.negativeProductFeatureLabels,
                },
            },
            positivePackagingLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.positivePackagingLabels,
                },
            },
            negativePackagingLabels: {
                type: "array",
                items: {
                    type: "string",
                    // enum: allTags.negativePackagingLabels,
                },
            },
        };
        let keys = Object.keys(properties);
        let schema: any = {
            type: "object",
            properties,
            required: keys,
        };
        const chain = createTaggingChain(schema, chatModel);
        let process_id = event.process_id

        const reviews = await Review.aggregate([
            {
                $match: { process_id: process_id },
            },
            {
                $project: { reviewText: { $ifNull: ["$reviewText", "$title"] }, rating: "$rating" },
            }
        ])

        const reviewPromises = reviews.map(async (review: any, index: number) => {
            return new Promise<void>(async (resolve) => {
                try {
                    let result: any = await chain.run(`Actual Rating:${review.rating} Review:${review.reviewText}`)
                    await Review.findByIdAndUpdate(review._id, { analysis: result }, { new: true }).catch(err => {
                        console.error(`error while updating review with analysis : ${err}`)
                    })
                    resolve()
                } catch (error) {
                    console.log(`error at index: ${index}`)
                    console.log(review)
                    console.error(error)
                    resolve()
                }
            })
        })
        await Promise.all(reviewPromises)
        await _Request.updateOne({
            process_id: event.process_id
        }, {
            isProcessCompleted: true,
            isAnalyseCompleted: true
        }, {
            new: true
        }).then(res => {
            console.log('updated isAnalysecompleted value in process_id:', event.process_id)
        }).catch(err => {
            console.error(err)
        })
        return null
    } catch (error) {
        console.error(error)
        return null
    }
}


const properties = {
    positivePricingLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    negativePricingLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    positiveDeliveryLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    negativeDeliveryLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    postiveProductFeatureLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    negativeProductFeatureLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    positivePackagingLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
    negativePackagingLabels: {
        type: "array",
        items: {
            type: "string",
        },
    },
};
const keys = Object.keys(properties);
const Tagslangchainschema: any = {
    type: "object",
    properties,
    required: keys,
};