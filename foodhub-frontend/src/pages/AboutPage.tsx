import React from 'react';

import { 
  Heart, 
  Users, 
  Truck, 
  Shield, 
  Star, 
  Award, 
  Globe, 
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Clients satisfaits' },
    { icon: Truck, value: '500+', label: 'Restaurants partenaires' },
    { icon: MapPin, value: '50+', label: 'Villes couvertes' },
    { icon: Star, value: '4.8/5', label: 'Note moyenne' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion pour la qualité',
      description: 'Nous sélectionnons rigoureusement nos partenaires pour garantir des plats d\'exception.'
    },
    {
      icon: Shield,
      title: 'Sécurité alimentaire',
      description: 'Tous nos restaurants respectent les normes d\'hygiène et de sécurité les plus strictes.'
    },
    {
      icon: Clock,
      title: 'Livraison rapide',
      description: 'Livraison en moins de 30 minutes pour vous faire profiter de vos plats chauds.'
    },
    {
      icon: Globe,
      title: 'Impact environnemental',
      description: 'Emballages écologiques et partenariat avec des producteurs locaux.'
    }
  ];

  const team = [
    {
      name: 'Sarah Koné',
      role: 'CEO & Fondatrice',
      image: '/images/team/sarah.jpg',
      description: 'Passionnée de gastronomie et d\'innovation technologique.'
    },
    {
      name: 'Moussa Traoré',
      role: 'CTO',
      image: '/images/team/moussa.jpg',
      description: 'Expert en développement et optimisation des plateformes digitales.'
    },
    {
      name: 'Fatou Diallo',
      role: 'Directrice Marketing',
      image: '/images/team/fatou.jpg',
      description: 'Spécialiste du marketing digital et de l\'expérience client.'
    },
    {
      name: 'Kouassi Jean',
      role: 'Directeur Opérationnel',
      image: '/images/team/kouassi.jpg',
      description: 'Expert en logistique et gestion des partenariats.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            }
            }
            }
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              À propos de{' '}
              <span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                FoodHub
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Votre plateforme de livraison de plats préférés, connectant les meilleurs restaurants 
              de Côte d'Ivoire à des clients passionnés de gastronomie.
            </p>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Découvrir notre histoire
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                }
                }
                }
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-12 h-12 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            }
            whileInView={{ opacity: 1, y: 0 }}
            }
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Révolutionner l'expérience de livraison de nourriture en Côte d'Ivoire en créant 
              une plateforme qui valorise la qualité, la rapidité et l'innovation technologique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                }
                whileInView={{ opacity: 1, y: 0 }}
                }
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <value.icon className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            }
            whileInView={{ opacity: 1, y: 0 }}
            }
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Notre Équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une équipe passionnée et expérimentée qui travaille chaque jour pour améliorer 
              votre expérience FoodHub.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                }
                whileInView={{ opacity: 1, y: 0 }}
                }
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-orange-400 to-green-500 p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-orange-500 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            }
            whileInView={{ opacity: 1, y: 0 }}
            }
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Notre Histoire
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-orange-200"></div>
            
            <div className="space-y-12">
              {[
                {
                  year: '2020',
                  title: 'Naissance de FoodHub',
                  description: 'Création de la plateforme avec une vision claire : révolutionner la livraison de nourriture en Côte d\'Ivoire.'
                },
                {
                  year: '2021',
                  title: 'Expansion à Abidjan',
                  description: 'Lancement officiel à Abidjan avec 50 restaurants partenaires et 1000 premiers clients.'
                },
                {
                  year: '2022',
                  title: 'Innovation technologique',
                  description: 'Intégration de la géolocalisation avancée et optimisation des algorithmes de livraison.'
                },
                {
                  year: '2023',
                  title: 'Expansion nationale',
                  description: 'Extension à 10 nouvelles villes et partenariat avec 500+ restaurants.'
                },
                {
                  year: '2024',
                  title: 'Leader du marché',
                  description: 'FoodHub devient la plateforme de référence avec 10,000+ clients satisfaits.'
                }
              ].map((milestone, index) => (
                <div
                  key={index}
                  }
                  whileInView={{ opacity: 1, x: 0 }}
                  }
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="text-2xl font-bold text-orange-500 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            }
            whileInView={{ opacity: 1, y: 0 }}
            }
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Rejoignez l'aventure FoodHub
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Découvrez les meilleurs restaurants de votre région et profitez d'une expérience 
              de livraison exceptionnelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Commander maintenant
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300"
              >
                Nous contacter
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

