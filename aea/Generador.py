import random
from faker import Faker
import json

# Inicializar Faker
faker = Faker()

# Lista de más de 50 tipos de comidas
comidas = [
    'Pizza', 'Sushi', 'Hamburguesas', 'Tacos', 'Ensaladas', 'Pasta', 'Lasagna', 'Burritos', 'Quesadillas', 'Ceviche',
    'Paella', 'Arepas', 'Empanadas', 'Tamales', 'Pozole', 'Mole', 'Ramen', 'Curry', 'Dim Sum', 'Shawarma',
    'Falafel', 'Samosas', 'Kebabs', 'Poke', 'Bibimbap', 'Dumplings', 'Pho', 'Gyozas', 'Pancakes', 'Waffles',
    'Crepas', 'Risotto', 'Pollo a la brasa', 'Barbacoa', 'Carnitas', 'Churrasco', 'Chiles rellenos',
    'Tortillas españolas', 'Gazpacho', 'Currywurst', 'Schnitzel', 'Fondue', 'Ratatouille', 'Hummus',
    'Tabulé', 'Biryani', 'Jollof rice', 'Tamagoyaki', 'Sopa de miso', 'Bulgogi', 'Yakitori', 'Choripán',
    'Poutine', 'Arequipe', 'Baklava'
]

# Generar 10,000 datos únicos
def generate_users():
    users = []
    for i in range(10000):
        user = {
            "name": faker.name(),
            "user_name": f"{faker.user_name()}_{i}",  # Garantizar unicidad
            "password": faker.password(),
            "foto": faker.image_url(),
            "verificado": random.choice(["Sí", "No"]),
            "comidaFavorita": random.choice(comidas),
            "descuentoNavideño": random.randint(0, 50),
        }
        users.append(user)
    return users

# Guardar en un archivo JSON
def save_to_json():
    users = generate_users()
    try:
        with open("users.json", "w", encoding="utf-8") as file:
            json.dump(users, file, ensure_ascii=False, indent=4)
        print("Datos generados y guardados en users.json con éxito")
    except Exception as e:
        print(f"Error al guardar los datos en JSON: {e}")

if __name__ == "__main__":
    save_to_json()
