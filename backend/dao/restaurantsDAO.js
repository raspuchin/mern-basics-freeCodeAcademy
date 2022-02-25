let restaurants;

export default class RestaurantsDAO {
    static async injectDB(conn) {
        if(restaurants){
            return;
        }
        try {
            restaurants = await conn.db(process.env.RESTREVIEWS_NS).collection("restaurants");
        } catch (e) {
            console.error(`Unable to establish a connection in restaurantsDAO ${e}`)
        }
    }

    static async getRestaurants({
        filters = null,
        page = 0,
        restaurantsPerPage = 20
    } = {}) {
        let query;
        if(filters) {
            if("name" in filters) {
                query = { $text: { $search: filters["name"] }}
            } else if ("cusine" in filters) {
                query = { "cusine": { $eq: filters["cusine"] }}
            } else if ("zipcode" in filters) {
                query = { "address.zipcode" : { $eq: filters["zipcode"] }}
            }
        }

        let cursor;
        try {
            cursor = await restaurants.find(query);
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`);
            return {
                restaurantsList: [],
                totalNumRestaurants: 0
            }
        }

        const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page);
        try {
            const restaurantsList = await displayCursor.toArray();
            const totalNumRestaurants = await restaurants.countDocuments(query);

            return {restaurantsList, totalNumRestaurants}
        } catch (e) {
            console.error(`Unable to convert cursor to array, ${e}`);
            return {
                restaurantsList: [],
                totalNumRestaurants: 0
            }
        }
    }
}