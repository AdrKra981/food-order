<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Restaurant;
use App\Enums\UserRole;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample restaurant owners and their restaurants
        $restaurants = [
            [
                'owner' => [
                    'name' => 'Anna Kowalska',
                    'email' => 'anna@pizzanapoli.pl',
                    'password' => bcrypt('password'),
                    'role' => UserRole::OWNER,
                ],
                'restaurant' => [
                    'name' => 'Pizza Napoli',
                    'description' => 'Autentyczne włoskie pizze robione z świeżych składników według tradycyjnych receptur. Rodzinny biznes prowadzony od 1985 roku.',
                    'cuisine_type' => 'Włoska',
                    'address' => 'ul. Krakowska 123',
                    'city' => 'Warszawa',
                    'lat' => 52.2297,
                    'lng' => 21.0122,
                    'phone_number' => '+48 22 123 45 67',
                    'email' => 'zamowienia@pizzanapoli.pl',
                    'website' => 'https://pizzanapoli.pl',
                    'delivery_fee' => 8.99,
                    'minimum_order' => 35.00,
                    'delivery_range_km' => 7,
                    'opening_hours' => '11:00',
                    'closing_hours' => '23:00',
                    'is_accepted' => true,
                ]
            ],
            [
                'owner' => [
                    'name' => 'Tomasz Nowak',
                    'email' => 'tomasz@smoczygarnek.pl',
                    'password' => bcrypt('password'),
                    'role' => UserRole::OWNER,
                ],
                'restaurant' => [
                    'name' => 'Smoczy Garnek',
                    'description' => 'Tradycyjna kuchnia chińska z nowoczesnymi akcentami. Świeże składniki, odważne smaki i autentyczne przyprawy.',
                    'cuisine_type' => 'Chińska',
                    'address' => 'ul. Żurawia 456',
                    'city' => 'Kraków',
                    'lat' => 50.0647,
                    'lng' => 19.9450,
                    'phone_number' => '+48 12 987 65 43',
                    'email' => 'info@smoczygarnek.pl',
                    'website' => 'https://smoczygarnek.pl',
                    'delivery_fee' => 9.50,
                    'minimum_order' => 45.00,
                    'delivery_range_km' => 10,
                    'opening_hours' => '17:00',
                    'closing_hours' => '22:30',
                    'is_accepted' => true,
                ]
            ],
            [
                'owner' => [
                    'name' => 'Marcin Wiśniewski',
                    'email' => 'marcin@burgerownia.pl',
                    'password' => bcrypt('password'),
                    'role' => UserRole::OWNER,
                ],
                'restaurant' => [
                    'name' => 'Burgerownia',
                    'description' => 'Przepyszne burgery z lokalnej wołowiny i świeżymi dodatkami. Najlepsze burgery w mieście!',
                    'cuisine_type' => 'Amerykańska',
                    'address' => 'ul. Piotrkowska 789',
                    'city' => 'Łódź',
                    'lat' => 51.7592,
                    'lng' => 19.4560,
                    'phone_number' => '+48 42 555 77 88',
                    'email' => 'zamowienia@burgerownia.pl',
                    'website' => 'https://burgerownia.pl',
                    'delivery_fee' => 6.99,
                    'minimum_order' => 28.00,
                    'delivery_range_km' => 8,
                    'opening_hours' => '10:00',
                    'closing_hours' => '24:00',
                    'is_accepted' => true,
                ]
            ],
            [
                'owner' => [
                    'name' => 'Kenji Yamamoto',
                    'email' => 'kenji@sakurasushi.pl',
                    'password' => bcrypt('password'),
                    'role' => UserRole::OWNER,
                ],
                'restaurant' => [
                    'name' => 'Sakura Sushi',
                    'description' => 'Świeże sushi i japońskie przysmaki przygotowywane przez mistrzów kuchni. Najwyższa jakość ryb i tradycyjne techniki.',
                    'cuisine_type' => 'Japońska',
                    'address' => 'ul. Wiśniowa 321',
                    'city' => 'Wrocław',
                    'lat' => 51.1079,
                    'lng' => 17.0385,
                    'phone_number' => '+48 71 444 55 66',
                    'email' => 'rezerwacje@sakurasushi.pl',
                    'website' => 'https://sakurasushi.pl',
                    'delivery_fee' => 12.99,
                    'minimum_order' => 55.00,
                    'delivery_range_km' => 6,
                    'opening_hours' => '16:00',
                    'closing_hours' => '22:00',
                    'is_accepted' => true,
                ]
            ],
            [
                'owner' => [
                    'name' => 'Carlos Rodriguez',
                    'email' => 'carlos@tacofiesta.pl',
                    'password' => bcrypt('password'),
                    'role' => UserRole::OWNER,
                ],
                'restaurant' => [
                    'name' => 'Taco Fiesta',
                    'description' => 'Autentyczne meksykańskie jedzenie uliczne z domowymi salsami i świeżymi tortillami robionymi codziennie.',
                    'cuisine_type' => 'Meksykańska',
                    'address' => 'ul. Słoneczna 654',
                    'city' => 'Gdańsk',
                    'lat' => 54.3520,
                    'lng' => 18.6466,
                    'phone_number' => '+48 58 333 22 11',
                    'email' => 'zamowienia@tacofiesta.pl',
                    'website' => 'https://tacofiesta.pl',
                    'delivery_fee' => 7.50,
                    'minimum_order' => 25.00,
                    'delivery_range_km' => 9,
                    'opening_hours' => '09:00',
                    'closing_hours' => '23:30',
                    'is_accepted' => true,
                ]
            ],
            [
                'owner' => [
                    'name' => 'Magdalena Zielińska',
                    'email' => 'magdalena@zdrowneziarno.pl',
                    'password' => bcrypt('password'),
                    'role' => UserRole::OWNER,
                ],
                'restaurant' => [
                    'name' => 'Zdrowe Ziarno',
                    'description' => 'Świeże, organiczne sałatki i zdrowe miski z lokalnych składników. Idealne dla osób dbających o zdrowie.',
                    'cuisine_type' => 'Zdrowa',
                    'address' => 'ul. Ekologiczna 987',
                    'city' => 'Poznań',
                    'lat' => 52.4064,
                    'lng' => 16.9252,
                    'phone_number' => '+48 61 777 88 99',
                    'email' => 'info@zdrowneziarno.pl',
                    'website' => 'https://zdrowneziarno.pl',
                    'delivery_fee' => 0.00,
                    'minimum_order' => 20.00,
                    'delivery_range_km' => 12,
                    'opening_hours' => '07:00',
                    'closing_hours' => '21:00',
                    'is_accepted' => true,
                ]
            ]
        ];

        foreach ($restaurants as $data) {
            // Create the user first
            $user = User::create($data['owner']);
            
            // Then create the restaurant and associate it with the user
            $restaurantData = $data['restaurant'];
            $restaurantData['user_id'] = $user->id;
            
            Restaurant::create($restaurantData);
        }
    }
}
