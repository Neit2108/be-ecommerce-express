import {
  PrismaClient,
  UserStatus,
  Gender,
  ShopStatus,
  ProductStatus,
  User,
  Category,
  Shop,
  Product,
  ProductOption,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.productVariantOptionValue.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create Users
  const users: User[] = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        identityCard: faker.string.numeric(12),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: `0${faker.string.numeric(9)}`,
        address: faker.location.streetAddress(),
        birthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender: faker.helpers.enumValue(Gender),
        avatarUrl: faker.image.avatar(),
        status: faker.helpers.enumValue(UserStatus),
        emailVerified: faker.datatype.boolean(0.8),
        emailVerifiedAt: faker.datatype.boolean(0.8) ? faker.date.past() : null,
        lastLoginAt: faker.date.recent({ days: 30 }),
      },
    });
    users.push(user);
  }
  console.log(`👥 Created ${users.length} users`);

  // Create Categories (hierarchical)
  const rootCategories: Category[] = [];
  const categoryNames = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Health & Beauty',
    'Automotive',
    'Food & Beverages',
  ];

  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: {
        name,
        description: faker.lorem.sentence(),
      },
    });
    rootCategories.push(category);
  }

  // Create subcategories
  const allCategories = [...rootCategories];
  for (const parent of rootCategories) {
    const subCategoryCount = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < subCategoryCount; i++) {
      const subCategory = await prisma.category.create({
        data: {
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
          parentCategoryId: parent.id,
        },
      });
      allCategories.push(subCategory);
    }
  }
  console.log(`📁 Created ${allCategories.length} categories`);

  // Create Shops
  const shops: Shop[] = [];
  const shopOwners = users.slice(0, 10); // First 10 users are shop owners

  for (const owner of shopOwners) {
    const shop = await prisma.shop.create({
      data: {
        ownerId: owner.id,
        name: faker.company.name(),
        status: faker.helpers.enumValue(ShopStatus),
        street: faker.location.streetAddress(),
        ward: faker.location.secondaryAddress(),
        district: faker.location.county(),
        city: faker.location.city(),
        country: 'Vietnamese',
        createdBy: owner.id,
      },
    });
    shops.push(shop);
  }
  console.log(`🏪 Created ${shops.length} shops`);

  // Create Products with variants and options
  const products: Product[] = [];
  for (const shop of shops) {
    const productCount = faker.number.int({ min: 5, max: 15 });

    for (let i = 0; i < productCount; i++) {
      const product = await prisma.product.create({
        data: {
          shopId: shop.id,
          name: faker.commerce.productName(),
          averageRating: parseFloat(
            faker.number.float({ min: 1, max: 5, fractionDigits: 1 }).toFixed(1)
          ),
          reviewCount: faker.number.int({ min: 0, max: 500 }),
          status: faker.helpers.enumValue(ProductStatus),
          createdBy: shop.ownerId,
        },
      });
      products.push(product);

      // Add product images
      const imageCount = faker.number.int({ min: 1, max: 5 });
      for (let j = 0; j < imageCount; j++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: faker.image.url(),
            isPrimary: j === 0,
            sortOrder: j,
            description: faker.lorem.words(3),
            createdBy: shop.ownerId,
          },
        });
      }

      // Add product to categories
      const categoryCount = faker.number.int({ min: 1, max: 3 });
      const selectedCategories = faker.helpers.arrayElements(
        allCategories,
        categoryCount
      );

      for (const category of selectedCategories) {
        await prisma.productCategory.create({
          data: {
            productId: product.id,
            categoryId: category.id,
            createdBy: shop.ownerId,
          },
        });
      }

      // Create product options (e.g., Size, Color)
      const optionTypes = ['Size', 'Color', 'Material'];
      const selectedOptionTypes = faker.helpers.arrayElements(
        optionTypes,
        faker.number.int({ min: 1, max: 2 })
      );

      const productOptions: ProductOption[] = [];
      for (const optionType of selectedOptionTypes) {
        const option = await prisma.productOption.create({
          data: {
            productId: product.id,
            name: optionType,
            createdBy: shop.ownerId,
          },
        });
        productOptions.push(option);

        // Create option values
        let optionValues: string[] = [];
        if (optionType === 'Size') {
          optionValues = ['XS', 'S', 'M', 'L', 'XL'];
        } else if (optionType === 'Color') {
          optionValues = ['Red', 'Blue', 'Green', 'Black', 'White'];
        } else if (optionType === 'Material') {
          optionValues = ['Cotton', 'Polyester', 'Wool', 'Silk'];
        }

        const selectedValues = faker.helpers.arrayElements(
          optionValues,
          faker.number.int({ min: 2, max: optionValues.length })
        );

        for (let k = 0; k < selectedValues.length; k++) {
          await prisma.productOptionValue.create({
            data: {
              productOptionId: option.id,
              value: selectedValues[k],
              sortOrder: k,
              createdBy: shop.ownerId,
            },
          });
        }
      }

      // Create product variants
      const variantCount = faker.number.int({ min: 1, max: 8 });
      for (let v = 0; v < variantCount; v++) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: faker.string.alphanumeric(8).toUpperCase(),
            name: `${product.name} - Variant ${v + 1}`,
            value: faker.commerce.productAdjective(),
            price: faker.commerce.price({ min: 10, max: 1000 }),
            currency: 'VND',
            status: faker.helpers.enumValue(ProductStatus),
            description: faker.lorem.sentence(),
            createdBy: shop.ownerId,
          },
        });

        // Add variant images
        const variantImageCount = faker.number.int({ min: 0, max: 3 });
        for (let vi = 0; vi < variantImageCount; vi++) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              imageUrl: faker.image.url(),
              isPrimary: vi === 0,
              sortOrder: vi,
              description: faker.lorem.words(2),
              createdBy: shop.ownerId,
            },
          });
        }

        // Link variant to option values (if options exist)
        if (productOptions.length > 0) {
          for (const option of productOptions) {
            const optionValues = await prisma.productOptionValue.findMany({
              where: { productOptionId: option.id },
            });

            if (optionValues.length > 0) {
              const selectedValue = faker.helpers.arrayElement(optionValues);

              try {
                await prisma.productVariantOptionValue.create({
                  data: {
                    productVariantId: variant.id,
                    productOptionId: option.id,
                    productOptionValueId: selectedValue.id,
                    createdBy: shop.ownerId,
                  },
                });
              } catch (error) {
                // Skip if combination already exists
                console.log(`Skipping duplicate variant option combination`);
              }
            }
          }
        }
      }
    }
  }
  console.log(
    `📦 Created ${products.length} products with variants and options`
  );

  console.log('✅ Seed completed successfully!');

  // Print summary
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productOption.count(),
    prisma.productOptionValue.count(),
    prisma.productImage.count(),
    prisma.productCategory.count(),
    prisma.productVariantOptionValue.count(),
  ]);

  console.log('\n📊 Final counts:');
  console.log(`Users: ${counts[0]}`);
  console.log(`Shops: ${counts[1]}`);
  console.log(`Categories: ${counts[2]}`);
  console.log(`Products: ${counts[3]}`);
  console.log(`Product Variants: ${counts[4]}`);
  console.log(`Product Options: ${counts[5]}`);
  console.log(`Product Option Values: ${counts[6]}`);
  console.log(`Product Images: ${counts[7]}`);
  console.log(`Product Categories: ${counts[8]}`);
  console.log(`Product Variant Option Values: ${counts[9]}`);
}

main()
  .then(() => {
    console.log('✅ Seed completed successfully!');
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });