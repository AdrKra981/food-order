<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedPizzaMenus();
        $this->seedPolishMenus();
        $this->seedIndianMenus();
        $this->seedSushiMenus();
        $this->seedMexicanMenus();
        $this->seedHealthyMenus();
    }

    private function createMenuItem($categoryId, $restaurantId, $name, $description, $price)
    {
        return MenuItem::create([
            'menu_category_id' => $categoryId,
            'restaurant_id' => $restaurantId,
            'name' => $name,
            'description' => $description,
            'price' => $price
        ]);
    }

    private function seedPizzaMenus()
    {
        $restaurant = Restaurant::where('name', 'Pizza Napoli')->first();
        if (!$restaurant) return;

        // Pizza Category
        $pizzaCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Pizze Klasyczne',
            'description' => 'Nasze autorskie pizze robione na cienkim cieście z piekarnika opalanego drewnem'
        ]);

        $pizzas = [
            ['name' => 'Margherita', 'description' => 'Sos pomidorowy, mozzarella, świeża bazylia', 'price' => 28.00],
            ['name' => 'Pepperoni', 'description' => 'Sos pomidorowy, mozzarella, pepperoni', 'price' => 32.00],
            ['name' => 'Quattro Stagioni', 'description' => 'Sos pomidorowy, mozzarella, szynka, pieczarki, papryka, oliwki', 'price' => 38.00],
            ['name' => 'Prosciutto e Funghi', 'description' => 'Sos pomidorowy, mozzarella, prosciutto, świeże pieczarki', 'price' => 36.00],
            ['name' => 'Diavola', 'description' => 'Sos pomidorowy, mozzarella, pikantne salami, chili', 'price' => 34.00],
            ['name' => 'Capricciosa', 'description' => 'Sos pomidorowy, mozzarella, szynka, pieczarki, karczoch', 'price' => 37.00]
        ];

        foreach ($pizzas as $pizza) {
            $this->createMenuItem($pizzaCategory->id, $restaurant->id, $pizza['name'], $pizza['description'], $pizza['price']);
        }

        // Pasta Category
        $pastaCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Pasta',
            'description' => 'Świeża pasta robiona codziennie w naszej kuchni'
        ]);

        $pastas = [
            ['name' => 'Spaghetti Carbonara', 'description' => 'Klasyczna carbonara z bekonem, żółtkami i pecorino', 'price' => 26.00],
            ['name' => 'Penne Arrabbiata', 'description' => 'Penne w pikantnym sosie pomidorowym z czosnkiem', 'price' => 24.00],
            ['name' => 'Fettuccine Alfredo', 'description' => 'Fettuccine w kremowym sosie z parmezanem', 'price' => 28.00],
            ['name' => 'Lasagne della Casa', 'description' => 'Domowa lasagne z mięsem, beszamelem i mozzarellą', 'price' => 32.00]
        ];

        foreach ($pastas as $pasta) {
            $this->createMenuItem($pastaCategory->id, $restaurant->id, $pasta['name'], $pasta['description'], $pasta['price']);
        }

        // Beverages
        $drinksCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Napoje',
            'description' => 'Orzeźwiające napoje do posiłku'
        ]);

        $drinks = [
            ['name' => 'Coca-Cola 0.5L', 'description' => 'Klasyczna cola w butelce', 'price' => 6.00],
            ['name' => 'Woda mineralna 0.5L', 'description' => 'Naturalna woda mineralna', 'price' => 4.00],
            ['name' => 'Lemoniada cytrynowa', 'description' => 'Domowa lemoniada ze świeżych cytryn', 'price' => 8.00]
        ];

        foreach ($drinks as $drink) {
            $this->createMenuItem($drinksCategory->id, $restaurant->id, $drink['name'], $drink['description'], $drink['price']);
        }
    }

    private function seedPolishMenus()
    {
        $restaurant = Restaurant::where('name', 'Smoczy Garnek')->first();
        if (!$restaurant) return;

        // Main Dishes
        $mainCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Dania Główne',
            'description' => 'Tradycyjne polskie potrawy według babcinych receptur'
        ]);

        $mains = [
            ['name' => 'Kotlet Schabowy', 'description' => 'Tradycyjny kotlet z ziemniakami i kapustą zasmażaną', 'price' => 28.00],
            ['name' => 'Pierogi Ruskie', 'description' => '8 sztuk pierogów z ziemniakami i twarogiem, podane ze skwarkami', 'price' => 22.00],
            ['name' => 'Bigos Staropolski', 'description' => 'Kapusta kwaszona duszona z mięsem i kiełbasą', 'price' => 24.00],
            ['name' => 'Gołąbki w Sosie Pomidorowym', 'description' => '3 sztuki gołąbków z mięsem i ryżem', 'price' => 26.00],
            ['name' => 'Żurek w Chlebie', 'description' => 'Kwaśny żurek z kiełbasą i jajkiem, podany w bochenku', 'price' => 20.00],
            ['name' => 'Flaki Warszawskie', 'description' => 'Tradycyjne flaki z warzywami i majerankiem', 'price' => 18.00]
        ];

        foreach ($mains as $main) {
            $this->createMenuItem($mainCategory->id, $restaurant->id, $main['name'], $main['description'], $main['price']);
        }

        // Soups
        $soupsCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Zupy',
            'description' => 'Rozgrzewające polskie zupy'
        ]);

        $soups = [
            ['name' => 'Rosół z Kury', 'description' => 'Tradycyjny rosół z makaronem i jarzynami', 'price' => 12.00],
            ['name' => 'Pomidorowa z Ryżem', 'description' => 'Zupa pomidorowa z ryżem i śmietaną', 'price' => 10.00],
            ['name' => 'Kapuśniak', 'description' => 'Zupa z kwaśnej kapusty z kiełbasą', 'price' => 14.00]
        ];

        foreach ($soups as $soup) {
            $this->createMenuItem($soupsCategory->id, $restaurant->id, $soup['name'], $soup['description'], $soup['price']);
        }
    }

    private function seedIndianMenus()
    {
        $restaurant = Restaurant::where('name', 'Bombaj Express')->first();
        if (!$restaurant) return;

        // Curry Category
        $curryCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Curry',
            'description' => 'Aromatyczne curry według autentycznych receptur z Indii'
        ]);

        $curries = [
            ['name' => 'Chicken Tikka Masala', 'description' => 'Kurczak w kremowym sosie pomidorowym z przyprawami', 'price' => 32.00],
            ['name' => 'Butter Chicken', 'description' => 'Delikatny kurczak w maślanym sosie z pomidorami', 'price' => 34.00],
            ['name' => 'Beef Madras', 'description' => 'Pikantna wołowina w sosie curry z kokosem', 'price' => 36.00],
            ['name' => 'Palak Paneer', 'description' => 'Ser cottage w sosie ze szpinaku', 'price' => 28.00],
            ['name' => 'Dal Tadka', 'description' => 'Soczewica w aromatycznych przyprawach', 'price' => 24.00]
        ];

        foreach ($curries as $curry) {
            $this->createMenuItem($curryCategory->id, $restaurant->id, $curry['name'], $curry['description'], $curry['price']);
        }

        // Breads & Rice
        $breadsCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Pieczywo i Ryż',
            'description' => 'Świeże chlebki naan i aromatyczne ryże'
        ]);

        $breads = [
            ['name' => 'Naan Butter', 'description' => 'Tradycyjny chlebek naan z masłem', 'price' => 8.00],
            ['name' => 'Garlic Naan', 'description' => 'Naan z czosnkiem i kolendrą', 'price' => 10.00],
            ['name' => 'Basmati Rice', 'description' => 'Aromatyczny ryż basmati', 'price' => 12.00],
            ['name' => 'Biryani Rice', 'description' => 'Przyprawiony ryż z szafranem', 'price' => 16.00]
        ];

        foreach ($breads as $bread) {
            $this->createMenuItem($breadsCategory->id, $restaurant->id, $bread['name'], $bread['description'], $bread['price']);
        }
    }

    private function seedSushiMenus()
    {
        $restaurant = Restaurant::where('name', 'Sakura Sushi')->first();
        if (!$restaurant) return;

        // Sushi Rolls
        $rollsCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Sushi Rolls',
            'description' => 'Świeże sushi z najwyższej jakości składników'
        ]);

        $rolls = [
            ['name' => 'California Roll (8szt)', 'description' => 'Krewetki, awokado, ogórek, masago', 'price' => 28.00],
            ['name' => 'Salmon Avocado Roll (8szt)', 'description' => 'Świeży łosoś z awokado', 'price' => 32.00],
            ['name' => 'Spicy Tuna Roll (8szt)', 'description' => 'Tuńczyk w pikantnym sosie z ogórkiem', 'price' => 35.00],
            ['name' => 'Philadelphia Roll (8szt)', 'description' => 'Łosoś, ser philadelphia, ogórek', 'price' => 36.00],
            ['name' => 'Dragon Roll (8szt)', 'description' => 'Krewetka tempura, awokado, sos unagi', 'price' => 42.00]
        ];

        foreach ($rolls as $roll) {
            $this->createMenuItem($rollsCategory->id, $restaurant->id, $roll['name'], $roll['description'], $roll['price']);
        }

        // Nigiri
        $nigiriCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Nigiri',
            'description' => 'Klasyczne nigiri z najświeższymi rybami'
        ]);

        $nigiris = [
            ['name' => 'Salmon Nigiri (2szt)', 'description' => 'Świeży łosoś na ryżu sushi', 'price' => 14.00],
            ['name' => 'Tuna Nigiri (2szt)', 'description' => 'Tuńczyk na ryżu sushi', 'price' => 18.00],
            ['name' => 'Shrimp Nigiri (2szt)', 'description' => 'Gotowane krewetki na ryżu', 'price' => 12.00],
            ['name' => 'Eel Nigiri (2szt)', 'description' => 'Węgorz w sosie unagi', 'price' => 16.00]
        ];

        foreach ($nigiris as $nigiri) {
            $this->createMenuItem($nigiriCategory->id, $restaurant->id, $nigiri['name'], $nigiri['description'], $nigiri['price']);
        }

        // Appetizers
        $appetizerCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Przystawki',
            'description' => 'Japońskie przystawki do sushi'
        ]);

        $appetizers = [
            ['name' => 'Edamame', 'description' => 'Gotowane zielone sojowe fasole z solą', 'price' => 12.00],
            ['name' => 'Gyoza (5szt)', 'description' => 'Smażone pierogi z mięsem i warzywami', 'price' => 18.00],
            ['name' => 'Miso Soup', 'description' => 'Tradycyjna zupa miso z tofu', 'price' => 8.00]
        ];

        foreach ($appetizers as $appetizer) {
            $this->createMenuItem($appetizerCategory->id, $restaurant->id, $appetizer['name'], $appetizer['description'], $appetizer['price']);
        }
    }

    private function seedMexicanMenus()
    {
        $restaurant = Restaurant::where('name', 'Taco Fiesta')->first();
        if (!$restaurant) return;

        // Tacos
        $tacosCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Tacos',
            'description' => 'Autentyczne meksykańskie tacos w świeżych tortillach'
        ]);

        $tacos = [
            ['name' => 'Tacos al Pastor (3szt)', 'description' => 'Marynowana wieprzowina z ananasem i kolendrą', 'price' => 24.00],
            ['name' => 'Tacos de Carnitas (3szt)', 'description' => 'Wolno duszona wieprzowina z cebulą', 'price' => 26.00],
            ['name' => 'Tacos de Pollo (3szt)', 'description' => 'Kurczak w przyprawach z awokado', 'price' => 22.00],
            ['name' => 'Fish Tacos (3szt)', 'description' => 'Grillowana ryba z kapustą i sosem chipotle', 'price' => 28.00],
            ['name' => 'Vegetarian Tacos (3szt)', 'description' => 'Grillowane warzywa z czarną fasolą', 'price' => 20.00]
        ];

        foreach ($tacos as $taco) {
            $this->createMenuItem($tacosCategory->id, $restaurant->id, $taco['name'], $taco['description'], $taco['price']);
        }

        // Burritos & Quesadillas
        $mainCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Burritos & Quesadillas',
            'description' => 'Syte dania główne w dużych tortillach'
        ]);

        $mains = [
            ['name' => 'Burrito Supreme', 'description' => 'Wołowina, ryż, czarna fasola, ser, salsa, śmietana', 'price' => 32.00],
            ['name' => 'Chicken Burrito', 'description' => 'Kurczak, ryż, papryka, cebula, guacamole', 'price' => 28.00],
            ['name' => 'Quesadilla Grande', 'description' => 'Duża quesadilla z serem i kurczakiem', 'price' => 24.00],
            ['name' => 'Veggie Burrito', 'description' => 'Grillowane warzywa, czarna fasola, ryż', 'price' => 26.00]
        ];

        foreach ($mains as $main) {
            $this->createMenuItem($mainCategory->id, $restaurant->id, $main['name'], $main['description'], $main['price']);
        }

        // Appetizers & Sides
        $sidesCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Przystawki i Dodatki',
            'description' => 'Klasyczne meksykańskie przystawki'
        ]);

        $sides = [
            ['name' => 'Guacamole & Chips', 'description' => 'Domowe guacamole z chipsami tortilla', 'price' => 16.00],
            ['name' => 'Nachos Supreme', 'description' => 'Chipsy z serem, jalapeno i śmietaną', 'price' => 18.00],
            ['name' => 'Mexican Rice', 'description' => 'Ryż z pomidorami i przyprawami', 'price' => 10.00],
            ['name' => 'Refried Beans', 'description' => 'Tradycyjna pasta z fasoli', 'price' => 8.00]
        ];

        foreach ($sides as $side) {
            $this->createMenuItem($sidesCategory->id, $restaurant->id, $side['name'], $side['description'], $side['price']);
        }
    }

    private function seedHealthyMenus()
    {
        $restaurant = Restaurant::where('name', 'Zdrowe Ziarno')->first();
        if (!$restaurant) return;

        // Salads
        $saladsCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Sałatki',
            'description' => 'Świeże sałatki z organicznych składników'
        ]);

        $salads = [
            ['name' => 'Caesar Salad', 'description' => 'Rzymska sałata, parmezan, grzanki, sos Caesar', 'price' => 22.00],
            ['name' => 'Quinoa Power Bowl', 'description' => 'Quinoa, awokado, pestki słonecznika, rukola', 'price' => 26.00],
            ['name' => 'Greek Salad', 'description' => 'Pomidory, ogórki, oliwki, feta, oregano', 'price' => 20.00],
            ['name' => 'Kale & Cranberry', 'description' => 'Jarmuż, suszone żurawiny, orzechy, vinaigrette', 'price' => 24.00],
            ['name' => 'Buddha Bowl', 'description' => 'Różnokolorowe warzywa, hummus, tahini', 'price' => 28.00]
        ];

        foreach ($salads as $salad) {
            $this->createMenuItem($saladsCategory->id, $restaurant->id, $salad['name'], $salad['description'], $salad['price']);
        }

        // Smoothies
        $smoothiesCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Smoothie',
            'description' => 'Odżywcze smoothie z świeżych owoców'
        ]);

        $smoothies = [
            ['name' => 'Green Power', 'description' => 'Szpinak, banan, ananas, kokos, spirulina', 'price' => 16.00],
            ['name' => 'Berry Blast', 'description' => 'Mieszanka jagód, banan, mleko owsiane', 'price' => 14.00],
            ['name' => 'Tropical Paradise', 'description' => 'Mango, ananas, marakuja, mleko kokosowe', 'price' => 15.00],
            ['name' => 'Protein Power', 'description' => 'Banan, masło orzechowe, białko roślinne', 'price' => 18.00]
        ];

        foreach ($smoothies as $smoothie) {
            $this->createMenuItem($smoothiesCategory->id, $restaurant->id, $smoothie['name'], $smoothie['description'], $smoothie['price']);
        }

        // Healthy Mains
        $healthyMainsCategory = MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'name' => 'Dania Główne',
            'description' => 'Syte i zdrowe dania główne'
        ]);

        $healthyMains = [
            ['name' => 'Grilled Salmon Bowl', 'description' => 'Łosoś z grilla, ryż brązowy, brokuły, awokado', 'price' => 34.00],
            ['name' => 'Chickpea Curry', 'description' => 'Ciecierzyca w mleku kokosowym ze szpinakiem', 'price' => 24.00],
            ['name' => 'Quinoa Stuffed Peppers', 'description' => 'Papryka nadziewana quinoa i warzywami', 'price' => 26.00],
            ['name' => 'Lentil Soup', 'description' => 'Kremowa zupa z czerwonej soczewicy', 'price' => 18.00]
        ];

        foreach ($healthyMains as $main) {
            $this->createMenuItem($healthyMainsCategory->id, $restaurant->id, $main['name'], $main['description'], $main['price']);
        }
    }
}
