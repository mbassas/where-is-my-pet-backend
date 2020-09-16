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

        const animal: Partial<Animal> = {};

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
            
            if (!animal.species && isSpecies(label.description.toUpperCase())) {
                animal.species = label.description.toUpperCase();
                continue;
            }
    
            if (!animal.breed) {
                animal.breed = await getBreedMatch(label.description, animal.species);
            }

            if (animal.species && animal.breed) {
                break;
            }
        }

        return animal;
    }

}

export default new ImageRecognitionModel();