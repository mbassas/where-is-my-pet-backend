import fs from "fs";
import vision from "@google-cloud/vision";
import { Animal } from "../Entities/animal";
import { google } from "@google-cloud/vision/build/protos/protos";
import speciesModel from "./speciesModel";
import breedModel from "./breedModel";
import stringSimilarity from "string-similarity";
import memoizee from "memoizee";

class ImageRecognitionModel {

    public async GetAnimalParams (imagePath: string): Promise<Partial<Animal>> {
        const client = new vision.ImageAnnotatorClient();
        
        const request = {
            image: {
                content: fs.readFileSync(imagePath)
            },
            features:  [{type: "LABEL_DETECTION"}]
        }
        const result = await client.annotateImage(request);

        const animal: Partial<Animal> = {
            species: "OTHER"
        };

        const species = await speciesModel.GetAllSpecies();

        //applies caching to a function to only execute it when needed
        const getBreeds = memoizee((species) => breedModel.GetBreedsBySpecies(species));
        
        function isSpecies(description: string): boolean {
            if (species.includes(description)) {
                return true;
            }
           return false;
        }

        async function getBreedMatch (description: string, detectedSpecies: string): Promise<string> {
            const breeds = await getBreeds(detectedSpecies);

            if (!breeds.length) {
                return "";
            }

            const breedMatch = stringSimilarity.findBestMatch(description, breeds);
            if (breedMatch.bestMatch.rating > 0.65) {
                return breedMatch.bestMatch.target;
            }
            return "";
        }
    
        if (!result[0]?.labelAnnotations?.length) {
            return animal;
        }

        for (let i = 0; i < result[0].labelAnnotations.length; i++) {
            const label = result[0].labelAnnotations[i];
            
            if (animal.species === "OTHER" && isSpecies(label.description.toUpperCase())) {
                animal.species = label.description.toUpperCase();
                continue;
            }
    
            if (!animal.breed) {
                animal.breed = await getBreedMatch(label.description, animal.species);
            }

            if (animal.species !== "OTHER" && animal.breed) {
                break;
            }
        }

        return animal;
    }

    public async hasInappropriateContent (imagePath: string): Promise<boolean> {
        const client = new vision.ImageAnnotatorClient();

        const [result] = await client.safeSearchDetection(imagePath);

        if (!result.safeSearchAnnotation) {
            return false;
        }
        
        const likelyUnsafe = Object.entries(result.safeSearchAnnotation).find(([key, value]) => {
            if (["LIKELY", "VERY_LIKELY"].includes(value) && key !== "spoof") {
                return true;
            }
        });

        return likelyUnsafe ? true : false;

    }

}

export default new ImageRecognitionModel();