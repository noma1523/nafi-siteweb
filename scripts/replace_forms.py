#!/usr/bin/env python3
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "scripts" / "_source_onepage.html").read_text(encoding="utf-8")

DISTRIB = '''<form class="nafi-form" id="formDistrib" data-context="distributeur" data-subject="NAFI — Candidature distributeur" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="_subject" value="NAFI — Candidature distributeur" />

        <p class="form-section">Informations de l'entreprise</p>
        <div class="field"><label for="d-raison">Raison sociale *</label><input id="d-raison" name="raison_sociale" type="text" required placeholder="Nom légal de l'entreprise" /></div>
        <div class="field-row">
          <div class="field"><label for="d-commercial">Nom commercial</label><input id="d-commercial" name="nom_commercial" type="text" /></div>
          <div class="field"><label for="d-rccm">Numéro RCCM</label><input id="d-rccm" name="rccm" type="text" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="d-nif">Numéro NIF</label><input id="d-nif" name="nif" type="text" /></div>
          <div class="field"><label for="d-creation">Date de création</label><input id="d-creation" name="date_creation" type="date" /></div>
        </div>
        <div class="field"><label for="d-web">Site web <span class="opt">(optionnel)</span></label><input id="d-web" name="site_web" type="url" placeholder="https://" /></div>

        <p class="form-section">Personne de contact</p>
        <div class="field-row">
          <div class="field"><label for="d-nom">Nom et prénom *</label><input id="d-nom" name="contact_nom" type="text" required /></div>
          <div class="field"><label for="d-fonction">Fonction *</label><input id="d-fonction" name="fonction" type="text" required /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="d-tel">Téléphone *</label><input id="d-tel" name="telephone" type="tel" required placeholder="+224 6XX XX XX XX" /></div>
          <div class="field"><label for="d-wa">WhatsApp *</label><input id="d-wa" name="whatsapp" type="tel" required placeholder="+224 6XX XX XX XX" /></div>
        </div>
        <div class="field"><label for="d-email">Adresse e-mail *</label><input id="d-email" name="email" type="email" required /></div>

        <p class="form-section">Localisation</p>
        <div class="field-row">
          <div class="field"><label for="d-pays">Pays *</label><input id="d-pays" name="pays" type="text" required value="Guinée" /></div>
          <div class="field"><label for="d-region">Région / Préfecture *</label><input id="d-region" name="region" type="text" required /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="d-ville">Ville *</label><input id="d-ville" name="ville" type="text" required /></div>
          <div class="field"><label for="d-adresse">Adresse complète *</label><input id="d-adresse" name="adresse" type="text" required /></div>
        </div>

        <p class="form-section">Activité commerciale</p>
        <div class="field"><label for="d-activite">Type d'activité *</label>
          <select id="d-activite" name="type_activite" required>
            <option value="">— Choisir —</option>
            <option>Grossiste</option><option>Distributeur</option><option>Supermarché</option>
            <option>Commerce de détail</option><option>Hôtel / Restaurant</option><option>Autre</option>
          </select>
        </div>
        <div class="field-row">
          <div class="field"><label for="d-exp">Années d'expérience *</label><input id="d-exp" name="experience" type="number" min="0" required /></div>
          <div class="field"><label for="d-pdv">Points de vente desservis *</label><input id="d-pdv" name="points_vente" type="number" min="0" required /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="d-vehic">Véhicules de livraison *</label><input id="d-vehic" name="vehicules" type="number" min="0" required /></div>
          <div class="field"><label for="d-effectif">Effectif de l'entreprise *</label><input id="d-effectif" name="effectif" type="number" min="0" required /></div>
        </div>

        <p class="form-section">Zone de distribution souhaitée</p>
        <div class="field"><label for="d-zone">Préfecture(s) ou région(s) souhaitée(s) *</label><input id="d-zone" name="zone_souhaitee" type="text" required /></div>
        <div class="field-row">
          <div class="field"><label for="d-entrepot">Disposez-vous d'un entrepôt ? *</label>
            <select id="d-entrepot" name="entrepot" required><option value="">— Choisir —</option><option>Oui</option><option>Non</option></select>
          </div>
          <div class="field"><label for="d-stockage">Capacité de stockage estimée</label><input id="d-stockage" name="capacite_stockage" type="text" placeholder="Ex. 200 palettes" /></div>
        </div>

        <p class="form-section">Motivation</p>
        <div class="field"><label for="d-motiv">Pourquoi souhaitez-vous devenir distributeur NAFI ? *</label><textarea id="d-motiv" name="motivation" rows="4" required></textarea></div>

        <p class="form-section">Documents à joindre</p>
        <div class="field"><label for="d-doc-rccm">Registre de commerce</label><input id="d-doc-rccm" name="doc_rccm" type="file" /></div>
        <div class="field"><label for="d-doc-nif">NIF</label><input id="d-doc-nif" name="doc_nif" type="file" /></div>
        <div class="field"><label for="d-doc-id">Pièce d'identité du responsable</label><input id="d-doc-id" name="doc_identite" type="file" /></div>
        <div class="field"><label for="d-doc-entrepot">Photo de l'entrepôt <span class="opt">(optionnel)</span></label><input id="d-doc-entrepot" name="doc_entrepot" type="file" accept="image/*" /></div>

        <label class="check-row check-row--solo"><input type="checkbox" name="certification" required /> <span>Je certifie que les informations fournies sont exactes.</span></label>
        <button type="submit" class="btn btn-primary btn-block">Soumettre ma candidature de distributeur</button>
        <p class="form-status" role="status"></p>
      </form>'''

COMMANDE = '''<form class="nafi-form" id="formCommande" data-context="commande" data-subject="NAFI — Demande de devis / commande" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="_subject" value="NAFI — Demande de devis / commande" />

        <p class="form-section">Coordonnées</p>
        <div class="field"><label for="o-nom">Nom complet *</label><input id="o-nom" name="nom" type="text" required /></div>
        <div class="field-row">
          <div class="field"><label for="o-societe">Société / Organisation</label><input id="o-societe" name="societe" type="text" /></div>
          <div class="field"><label for="o-fonction">Fonction</label><input id="o-fonction" name="fonction" type="text" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="o-tel">Téléphone *</label><input id="o-tel" name="telephone" type="tel" required placeholder="+224 6XX XX XX XX" /></div>
          <div class="field"><label for="o-wa">WhatsApp</label><input id="o-wa" name="whatsapp" type="tel" placeholder="+224 6XX XX XX XX" /></div>
        </div>
        <div class="field"><label for="o-email">E-mail *</label><input id="o-email" name="email" type="email" required /></div>

        <p class="form-section">Adresse de livraison</p>
        <div class="field-row">
          <div class="field"><label for="o-pays">Pays *</label><input id="o-pays" name="pays" type="text" required value="Guinée" /></div>
          <div class="field"><label for="o-ville">Ville *</label><input id="o-ville" name="ville" type="text" required /></div>
        </div>
        <div class="field"><label for="o-adresse">Adresse complète *</label><input id="o-adresse" name="adresse" type="text" required placeholder="Commune, quartier, repère" /></div>

        <p class="form-section">Produits souhaités</p>
        <fieldset class="formats-fieldset">
          <legend>Quantités souhaitées (en packs)</legend>
          <div class="qty-row"><label for="q-033">Eau NAFI — 0,33 L</label><input id="q-033" class="qty-input" name="qte_033" type="number" min="0" placeholder="0" /></div>
          <div class="qty-row"><label for="q-05">Eau NAFI — 0,5 L</label><input id="q-05" class="qty-input" name="qte_05" type="number" min="0" placeholder="0" /></div>
          <div class="qty-row"><label for="q-15">Eau NAFI — 1,5 L</label><input id="q-15" class="qty-input" name="qte_15" type="number" min="0" placeholder="0" /></div>
          <div class="qty-row"><label for="q-autre">Eau NAFI — Autre format</label><input id="q-autre" class="qty-input" name="qte_autre" type="text" placeholder="—" /></div>
        </fieldset>

        <p class="form-section">Informations commerciales</p>
        <div class="field-row">
          <div class="field"><label for="o-client">Type de client *</label>
            <select id="o-client" name="type_client" required><option value="">— Choisir —</option><option>Particulier</option><option>Revendeur</option><option>Grossiste</option><option>Entreprise</option><option>Administration</option><option>Hôtel</option><option>Restaurant</option><option>Événement</option></select>
          </div>
          <div class="field"><label for="o-freq">Fréquence d'achat</label>
            <select id="o-freq" name="frequence"><option value="">— Choisir —</option><option>Achat unique</option><option>Hebdomadaire</option><option>Mensuel</option><option>Trimestriel</option></select>
          </div>
        </div>

        <p class="form-section">Détails complémentaires</p>
        <div class="field-row">
          <div class="field"><label for="o-date">Date souhaitée de livraison</label><input id="o-date" name="date_livraison" type="date" /></div>
          <div class="field"><label for="o-devis">Besoin d'un devis officiel ?</label><select id="o-devis" name="devis_officiel"><option value="">— Choisir —</option><option>Oui</option><option>Non</option></select></div>
        </div>
        <div class="field"><label for="o-msg">Message</label><textarea id="o-msg" name="message" rows="3" placeholder="Décrivez votre besoin en détail."></textarea></div>

        <label class="check-row check-row--solo"><input type="checkbox" name="consentement" required /> <span>J'accepte d'être contacté concernant cette demande.</span></label>
        <button type="submit" class="btn btn-primary btn-block">Recevoir mon devis</button>
        <p class="form-status" role="status"></p>
      </form>'''

QUESTION = '''<form class="nafi-form" id="formQuestion" data-context="question" data-subject="NAFI — Question / contact" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="_subject" value="NAFI — Question / contact" />

        <p class="form-section">Informations personnelles</p>
        <div class="field"><label for="q-nom">Nom complet *</label><input id="q-nom" name="nom" type="text" required placeholder="Votre nom" /></div>
        <div class="field-row">
          <div class="field"><label for="q-tel">Téléphone *</label><input id="q-tel" name="telephone" type="tel" required placeholder="+224 6XX XX XX XX" /></div>
          <div class="field"><label for="q-email">E-mail</label><input id="q-email" name="email" type="email" placeholder="vous@exemple.com" /></div>
        </div>

        <div class="field"><label for="q-sujet">Sujet de la demande</label>
          <select id="q-sujet" name="sujet"><option value="">— Choisir —</option><option>Information produit</option><option>Prix et tarifs</option><option>Distribution</option><option>Partenariat</option><option>Livraison</option><option>Réclamation</option><option>Qualité des produits</option><option>Presse et médias</option><option>Autre</option></select>
        </div>

        <div class="field"><label for="q-msg">Votre message *</label><textarea id="q-msg" name="message" rows="4" required placeholder="Décrivez votre demande ou votre question en détail."></textarea></div>

        <div class="field"><label for="q-moyen">Moyen de réponse préféré</label>
          <select id="q-moyen" name="moyen_reponse"><option value="">— Choisir —</option><option>Téléphone</option><option>WhatsApp</option><option>E-mail</option></select>
        </div>

        <div class="field"><label for="q-piece">Pièce jointe <span class="opt">(optionnel)</span></label><input id="q-piece" name="piece_jointe" type="file" /></div>

        <label class="check-row check-row--solo"><input type="checkbox" name="verification" required /> <span>Je confirme que les informations fournies sont exactes.</span></label>
        <button type="submit" class="btn btn-primary btn-block">Envoyer ma demande</button>
        <p class="form-status" role="status"></p>
      </form>'''

def swap(src, formid, new):
    pat = re.compile(r'<form class="nafi-form" id="%s".*?</form>' % re.escape(formid), re.S)
    n = pat.subn(new, src)
    if n[1] != 1: raise SystemExit("remplacement %s : %d" % (formid, n[1]))
    return n[0]

src = swap(src, "formDistrib", DISTRIB)
src = swap(src, "formCommande", COMMANDE)
src = swap(src, "formQuestion", QUESTION)
(ROOT / "scripts" / "_source_onepage.html").write_text(src, encoding="utf-8")
print("formulaires remplacés")
