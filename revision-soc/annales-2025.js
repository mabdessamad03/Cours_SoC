"use strict";

window.SOC_EXAMS_2025 = [
  {
    year: "2026",
    label: "2025–2026",
    title: "Examen SEOC CEAMC — 16 janvier 2026",
    pdf: "../Ex-Annales/examen%202025-2026.pdf",
    intro: `<p><strong>Sujet sur 9 pages · calculatrice basique autorisée · aucun document autorisé.</strong> Cette correction reprend les questions du scan dans leur ordre et leur formulation. Les deux premières pages de contenu portent sur les processeurs multicœurs et leur programmation ; la seconde partie traite du DMA, de la SPRAM, de l’image intégrale et du tuilage mémoire.</p>
      <p>Lorsque le sujet laisse une convention implicite — format 8/32 bits entre les deux passes ou traitement des bords de l’image — la correction donne d’abord la lecture architecturalement rigoureuse, puis la valeur obtenue avec la simplification probablement attendue.</p>`,
    sections: [
      {
        title: "1 · Multiprocesseurs et cohérence de cache",
        theme: "MSI & caches",
        context: `<p><strong>Données communes reproduites du sujet.</strong> Deux processeurs possèdent chacun des caches L1 séparés pour les instructions et les données. Les adresses mémoire font 16 bits, les instructions 32 bits et les données 16 bits. Les deux processeurs et leurs caches sont reliés à la mémoire par un bus partagé.</p>
          <p>Le cache de données a une capacité de 32 octets, des lignes de 4 octets, une correspondance directe, une politique <em>write-back</em>, le <em>write-allocate</em> et le protocole de cohérence MSI à base de <em>snoop</em>. Au départ, toutes les lignes des deux caches sont invalides.</p>
          <div class="table-scroll"><table class="compare-table"><thead><tr><th>Adresse</th><th>Donnée</th><th>Adresse</th><th>Donnée</th></tr></thead><tbody>
            <tr><td><code>0xc018</code></td><td><code>0xa1e7</code></td><td><code>0x200e</code></td><td><code>0xc3b8</code></td></tr>
            <tr><td><code>0xc016</code></td><td><code>0x64fc</code></td><td><code>0x200c</code></td><td><code>0x265e</code></td></tr>
            <tr><td><code>0xc014</code></td><td><code>0xd154</code></td><td><code>0x200a</code></td><td><code>0xbcc4</code></td></tr>
            <tr><td><code>0xc012</code></td><td><code>0xf2cf</code></td><td><code>0x2008</code></td><td><code>0xfebb</code></td></tr>
            <tr><td><code>0xc010</code></td><td><code>0x3aae</code></td><td><code>0x2006</code></td><td><code>0x0000</code></td></tr>
            <tr><td><code>0xc00e</code></td><td><code>0x224e</code></td><td><code>0x2004</code></td><td><code>0x0123</code></td></tr>
            <tr><td><code>0xc00c</code></td><td><code>0x2da9</code></td><td><code>0x2002</code></td><td><code>0xcafe</code></td></tr>
            <tr><td><code>0xc00a</code></td><td><code>0x1c33</code></td><td><code>0x2000</code></td><td><code>0xdead</code></td></tr>
            <tr><td><code>0xc008</code></td><td><code>0x5072</code></td><td>…</td><td>…</td></tr>
          </tbody></table></div>
          <p>Pour chaque accès, le sujet demande l’opération processeur, les transactions du bus avec l’adresse de ligne, les seules lignes mémoire/cache affectées et, pour une lecture, le mot transmis au processeur. <strong>L’état produit par une question est réutilisé à la question suivante.</strong></p>
          <p>Décodage utile : <code>adresse_bus = adresse_octet &gt;&gt; 2</code>, <code>index = (adresse_octet &gt;&gt; 2) mod 8</code>, <code>tag = adresse_octet &gt;&gt; 5</code>. La ligne <code>0xc008–0xc00b</code> donne bus <code>0x3002</code>, index 2, tag <code>0x600</code>. La ligne <code>0x2004–0x2007</code> donne bus <code>0x0801</code>, index 1, tag <code>0x100</code>.</p>`,
        questions: [
          {
            n: "1.1",
            title: "P0 écrit 0xf00d à l’adresse 0xc008",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Exercice 1.1 (1,5 point) :</strong> Processeur 0 : <code>WRITE(@0xc008, 0xf00d)</code></p>`,
            answer: `<h4>1. Identifier la ligne et le type d’accès</h4>
              <p><code>0xc008</code> appartient à la ligne de 4 octets <code>0xc008–0xc00b</code>. Cette ligne contient les deux mots 16 bits <code>0x5072</code> à l’adresse basse et <code>0x1c33</code> à l’adresse haute. Son adresse sur le bus est <code>0xc008 &gt;&gt; 2 = 0x3002</code>, son index vaut 2 et son tag <code>0x600</code>.</p>
              <p>Le cache de P0 est vide : l’écriture est donc un <strong>write miss</strong>. Avec le <em>write-allocate</em>, P0 demande la ligne en exclusivité, la reçoit, puis remplace localement le mot d’adresse <code>0xc008</code>.</p>
              <h4>2. Transactions et nouvel état</h4>
              <pre><code>&lt;bus, @0x3002, Write Miss&gt;;
&lt;mémoire, @0xc00b-@0xc008, 0x1c33 0x5072&gt;;
&lt;cache 0, index 2, étiquette/tag 0x600,
 état M, données 0x1c33 0xf00d&gt;;</code></pre>
              <p>Aucun autre cache ne détient la ligne. P0 passe donc en <strong>M</strong>. Comme la politique est <em>write-back</em>, la mémoire garde encore <code>0x5072</code> à <code>0xc008</code> ; la valeur <code>0xf00d</code> n’existe pour l’instant que dans le cache de P0.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Écriture manquée avec allocation : Bus Write Miss sur <code>0x3002</code>, puis cache 0, index 2, tag <code>0x600</code>, état M, données <code>0x1c33 0xf00d</code>. La mémoire reste inchangée.</p>`,
            intuition: `<p>P0 prend la propriété exclusive de la ligne entière, mais ne modifie qu’un de ses deux mots.</p>`,
            trap: `<p>Ne pas écrire immédiatement <code>0xf00d</code> en mémoire : <em>write-back</em> signifie que la nouvelle valeur reste sale dans le cache jusqu’à un flush ou une éviction.</p>`
          },
          {
            n: "1.2",
            title: "P1 écrit dans la ligne modifiée de P0",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Exercice 1.2 (1,5 point) :</strong> Processeur 1 : <code>WRITE(@0xc00a, 0xbabe)</code></p>`,
            answer: `<h4>1. Réutiliser l’état de 1.1</h4>
              <p>P0 détient la ligne <code>0xc008–0xc00b</code> en M avec <code>0x1c33 0xf00d</code>. P1 ne la possède pas. Or <code>0xc00a</code> appartient à cette même ligne : P1 émet une demande d’écriture exclusive sur l’adresse de bus <code>0x3002</code>.</p>
              <h4>2. Réaction MSI du propriétaire M</h4>
              <p>P0 espionne le Write Miss. Sa copie est la seule à jour ; il doit la fournir ou la restituer sur le bus, ce que la notation du sujet décrit comme un <strong>Write Back</strong>, puis passer de M à I. La mémoire reçoit donc d’abord <code>0x1c33 0xf00d</code>. P1 reçoit cette version, remplace le mot haut par <code>0xbabe</code> et passe en M.</p>
              <pre><code>&lt;bus, @0x3002, Write Miss de P1&gt;;
&lt;bus, @0x3002, Write Back de P0&gt;;
&lt;mémoire, @0xc00b-@0xc008, 0x1c33 0xf00d&gt;;
&lt;cache 0, index 2, tag 0x600, état I,
 données 0x1c33 0xf00d&gt;;
&lt;cache 1, index 2, tag 0x600, état M,
 données 0xbabe 0xf00d&gt;;</code></pre>
              <p>La mémoire contient maintenant <code>0xf00d</code> au mot bas, mais encore <code>0x1c33</code> au mot haut : le nouveau <code>0xbabe</code> est sale dans P1.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> P1 obtient la ligne par Write Miss ; P0 fait un Write Back et M→I. P1 termine en M avec <code>0xbabe 0xf00d</code>, tandis que la mémoire vaut <code>0x1c33 0xf00d</code>.</p>`,
            intuition: `<p>Avant de céder la ligne, P0 doit transmettre sa version récente contenant déjà le <code>0xf00d</code> de la question précédente.</p>`,
            trap: `<p>Ne pas repartir du contenu initial <code>0x1c33 0x5072</code> : les questions sont cumulatives.</p>`
          },
          {
            n: "1.3",
            title: "P0 relit la valeur détenue en M par P1",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Exercice 1.3 (1,5 point) :</strong> Processeur 0 : <code>READ(@0xc00a)</code></p>`,
            answer: `<h4>1. Situer la donnée la plus récente</h4>
              <p>Après 1.2, P0 est I et P1 est M pour la ligne de bus <code>0x3002</code>. La mémoire ne contient pas encore <code>0xbabe</code> ; seul P1 possède la bonne valeur. La lecture de P0 est donc un Read Miss.</p>
              <h4>2. Intervention et partage</h4>
              <p>P1 espionne la requête, restitue la ligne <code>0xbabe 0xf00d</code>, puis M→S. P0 reçoit la même ligne et I→S. La restitution remet aussi la mémoire à jour.</p>
              <pre><code>&lt;bus, @0x3002, Read Miss de P0&gt;;
&lt;bus, @0x3002, Write Back de P1&gt;;
&lt;mémoire, @0xc00b-@0xc008, 0xbabe 0xf00d&gt;;
&lt;cache 0, index 2, tag 0x600, état S,
 données 0xbabe 0xf00d&gt;;
&lt;cache 1, index 2, tag 0x600, état S,
 données 0xbabe 0xf00d&gt;;
&lt;proc 0, 0xbabe&gt;;</code></pre>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le Read Miss de P0 provoque l’intervention de P1 : P1 M→S, P0 I→S, mémoire et deux caches contiennent <code>0xbabe 0xf00d</code>, et P0 reçoit <code>0xbabe</code>.</p>`,
            intuition: `<p>Une lecture distante ne vole pas l’exclusivité pour écrire : elle transforme la copie sale unique en deux copies propres partagées.</p>`,
            trap: `<p>Répondre depuis la mémoire avant le flush de P1 donnerait l’ancienne valeur <code>0x1c33</code>, donc une incohérence.</p>`
          },
          {
            n: "1.4",
            title: "P0 charge une autre ligne à l’index 1",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Exercice 1.4 (1,5 points) :</strong> Processeur 0 : <code>READ(@0x2004)</code></p>`,
            answer: `<h4>1. Décoder la nouvelle adresse</h4>
              <p><code>0x2004</code> appartient à la ligne <code>0x2004–0x2007</code>. Son adresse bus vaut <code>0x2004 &gt;&gt; 2 = 0x0801</code>, son index 1 et son tag <code>0x100</code>. Elle ne remplace donc pas la ligne précédente, située à l’index 2.</p>
              <h4>2. Charger la ligne</h4>
              <p>Aucun cache ne possède cette ligne. P0 émet un Read Miss et reçoit les mots <code>0x0000</code> à <code>0x2006</code> et <code>0x0123</code> à <code>0x2004</code>. En MSI, une lecture manquée place la ligne en S, même s’il n’existe pas encore d’autre partageur.</p>
              <pre><code>&lt;bus, @0x0801, Read Miss&gt;;
&lt;mémoire, @0x2007-@0x2004, 0x0000 0x0123&gt;;
&lt;cache 0, index 1, tag 0x100, état S,
 données 0x0000 0x0123&gt;;
&lt;proc 0, 0x0123&gt;;</code></pre>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> P0 charge par Read Miss la ligne <code>0x0801</code> à l’index 1, tag <code>0x100</code>, état S, et reçoit le mot <code>0x0123</code>.</p>`,
            intuition: `<p>Les deux adresses étudiées utilisent des index différents : P0 peut donc garder simultanément sa ligne <code>0xc008</code> et cette nouvelle ligne.</p>`,
            trap: `<p>Le mot lu est celui de l’adresse <code>0x2004</code>, donc <code>0x0123</code>, pas le premier mot affiché dans l’ordre descendant de la ligne.</p>`
          },
          {
            n: "1.5",
            title: "P1 invalide la copie partagée de P0",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Exercice 1.5 (1,5 points) :</strong> Processeur 1 : <code>WRITE(@0x2006, 0x4567)</code></p>`,
            answer: `<h4>1. État avant l’écriture</h4>
              <p>P0 détient la ligne <code>0x2004–0x2007</code> en S à l’index 1 ; P1 ne la détient pas. L’adresse <code>0x2006</code> cible le mot haut de cette ligne. P1 doit donc demander la ligne en exclusivité par un Write Miss.</p>
              <h4>2. Invalidation et write-back différé</h4>
              <p>La demande exclusive invalide la copie propre de P0 : S→I, sans Write Back. P1 charge la ligne, modifie le mot haut et devient M. La mémoire garde <code>0x0000 0x0123</code> tant que P1 ne restitue pas sa ligne sale.</p>
              <pre><code>&lt;bus, @0x0801, Write Miss de P1&gt;;
&lt;mémoire, @0x2007-@0x2004, 0x0000 0x0123&gt;;
&lt;cache 0, index 1, tag 0x100, état I,
 données 0x0000 0x0123&gt;;
&lt;cache 1, index 1, tag 0x100, état M,
 données 0x4567 0x0123&gt;;</code></pre>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le Write Miss de P1 invalide P0 sans write-back ; P1 passe en M avec <code>0x4567 0x0123</code>. La mémoire reste <code>0x0000 0x0123</code>.</p>`,
            intuition: `<p>La copie de P0 est propre : il suffit de la rendre invalide. Il n’y a rien de nouveau à recopier en mémoire.</p>`,
            trap: `<p>Ne pas ajouter une seconde transaction d’invalidation indépendante : dans la convention du sujet, le Write Miss demande déjà l’exclusivité et porte l’invalidation.</p>`
          }
        ]
      },
      {
        title: "2 · Instructions atomiques",
        theme: "Atomiques RISC-V",
        context: `<p>Prototype exact donné par le sujet : <code>unsigned int add_modulo(unsigned int *v, unsigned int n, unsigned int m)</code>.</p>
          <p>La routine <code>add_modulo</code> réalise <code>*v = (*v + n) % m</code> et retourne la valeur avant modification. Le processeur cible n’implémente pas l’extension M : <code>mul</code>, <code>div</code> et <code>rem</code> sont donc indisponibles. Plusieurs processeurs peuvent appeler la fonction simultanément sur la même adresse.</p>
          <p>La carte de référence RISC‑V fournie pages 4–5 rappelle notamment <code>lr.w</code> et <code>sc.w</code>, ainsi que la convention d’appel : <code>a0–a7</code> portent les arguments, <code>a0</code> la valeur de retour, et <code>t0–t6</code> sont temporaires.</p>`,
        questions: [
          {
            n: "2.1",
            title: "Écrire add_modulo avec LR/SC, sans extension M",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Exercice 2.1 (3 points) :</strong> Proposez une routine en assembleur RISC-V permettant d’implémenter la fonction <code>add_modulo</code>. Rappel : les instructions de multiplication, division ou modulo ne sont pas disponibles.</p>`,
            answer: `<h4>1. Convention et préconditions</h4>
              <p>Sur la cible RV64 de la carte : <code>a0=v</code> (donc <code>a0</code> contient l’adresse de l’objet <code>*v</code>), <code>a1=n</code>, <code>a2=m</code> et le retour doit être placé dans <code>a0</code>. Les objets <code>unsigned int</code> font 32 bits. On suppose <code>m≠0</code> — le modulo zéro est indéfini — et <code>v</code> correctement aligné.</p>
              <h4>2. Routine proposée</h4>
              <pre><code>add_modulo:
    # m est un unsigned int : le zéro-étendre pour les comparaisons RV64
    slli    a2, a2, 32
    srli    a2, a2, 32

recompute:
    lw      t0, (a0)          # instantané, hors de la réservation

compute_candidate:
    addw    t1, t0, a1        # addition unsigned 32 bits, avec wrap C
    slli    t1, t1, 32        # zéro-extension du résultat 32 bits
    srli    t1, t1, 32

reduce_modulo:
    bltu    t1, a2, try_store # terminé dès que t1 &lt; m
    sub     t1, t1, a2        # t1 -= m, sans remu
    j       reduce_modulo

try_store:
    lr.w    t3, (a0)          # réservation courte + relecture de validation
    bne     t3, t0, changed   # valeur modifiée : tout recalculer
    sc.w    t2, t1, (a0)      # t2=0 si le store réussit
    bnez    t2, try_store      # échec éventuel : reprendre un nouveau LR

    mv      a0, t0             # retour uint32 ABI : extension signée sur RV64
    ret

changed:
    mv      t0, t3             # nouvel ancien *v
    j       compute_candidate</code></pre>
              <h4>3. Pourquoi l’opération est atomique</h4>
              <ol>
                <li>Le candidat est d’abord calculé par soustractions répétées, sans extension M et surtout <strong>avant</strong> d’ouvrir la réservation.</li>
                <li><code>lr.w</code> relit ensuite <code>*v</code>. Si cette valeur diffère de l’instantané <code>t0</code>, le candidat est périmé et on le recalcule.</li>
                <li>Sinon, <code>sc.w</code> constitue le point de linéarisation : il écrit seulement si aucune écriture concurrente n’a invalidé la réservation.</li>
                <li>Après un échec éventuel, <code>try_store</code> reprend par un nouveau <code>lr.w</code>. La séquence réservée reste ainsi courte et conforme aux contraintes de progression LR/SC.</li>
                <li><code>mv a0,t0</code> renvoie l’ancienne valeur avec l’extension signée exigée par l’ABI RV64 pour une valeur C de 32 bits.</li>
              </ol>
              <p>Sur RV32, <code>add</code> remplace <code>addw</code> et les paires <code>slli/srli</code> de zéro-extension sont inutiles. La soustraction répétée est correcte mais lente si <code>m</code> est très petit ; une réduction binaire serait une optimisation, pas une condition de correction.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le modulo est calculé sans extension M, puis une courte paire LR/SC valide que l’ancienne valeur n’a pas changé et publie atomiquement la nouvelle. En cas de conflit réel, le calcul repart de la valeur fraîche.</p>`,
            intuition: `<p>On fait le calcul long avant de « réserver » la case. Juste avant l’écriture, LR vérifie que la photo de départ est encore valable ; SC ferme ensuite la porte atomiquement.</p>`,
            trap: `<p>Éviter une longue boucle de calcul entre <code>lr.w</code> et <code>sc.w</code> : elle peut être atomiquement correcte, mais sortir des séquences LR/SC contraintes pour lesquelles l’architecture garantit la progression.</p>`
          }
        ]
      },
      {
        title: "2.1 · Fonctionnement du DMA",
        theme: "DMA & SPRAM",
        context: `<p><strong>2eme partie — Gestion de la mémoire · AAA pour la détection d’objet.</strong> Le système contient un processeur 32 bits avec cache et SPRAM accessibles en un cycle, un DMA muni d’un tampon, un bus système 64 bits et un contrôleur de DDR externe. Le DMA est configuré par les adresses de départ et d’arrivée et par la quantité à transférer ; il interrompt le CPU lorsque le transfert est complètement terminé. Son tampon a la taille d’un burst maximal.</p>
          <ul><li>bus : 64 bits, soit 8 octets par mot ;</li><li><code>bmax</code> : taille maximale d’un burst en octets ;</li><li><code>lm</code> : latence d’accès en lecture à la mémoire externe ;</li><li><code>lSPRAM</code> : latence d’écriture vers la SPRAM ;</li><li><code>tIT</code> : délai minimal entre l’apparition de l’interruption et la première instruction de l’ISR, sauvegarde de contexte comprise.</li></ul>`,
        questions: [
          {
            n: "P2 · Q1",
            title: "Distinguer SPRAM et cache en deux phrases",
            verbatim: true,
            sourcePage: 6,
            prompt: `<p><strong>Question 1 :</strong><br>Rappeler en deux phrases la différence entre une SPRAM et un cache.</p>`,
            answer: `<h4>1. Le critère qui distingue vraiment les deux</h4>
              <p>Les deux mémoires peuvent physiquement être construites en SRAM, être petites et être proches du processeur. La différence demandée porte sur leur <strong>mode de gestion</strong> : le cache est transparent et automatique ; la SPRAM est une mémoire adressable explicitement.</p>
              <div class="table-scroll"><table class="compare-table"><thead><tr><th>Cache</th><th>SPRAM</th></tr></thead><tbody><tr><td>Copies de blocs choisies automatiquement par le matériel</td><td>Données placées par le logiciel ou le DMA</td></tr><tr><td>Tags, hit/miss, remplacement</td><td>Pas de tags ni de remplacement automatique</td></tr><tr><td>Latence variable en présence d’un miss</td><td>Placement et accès déterministes</td></tr></tbody></table></div>
              <h4>2. Réponse respectant « en deux phrases »</h4>
              <p class="answer-conclusion"><strong>Un cache est une mémoire de copies gérée automatiquement et de manière transparente par le matériel, au moyen de tags, de hits, de misses et d’une politique de remplacement. Une SPRAM est une mémoire locale adressable et gérée explicitement par le logiciel ou le DMA, ce qui rend le placement des données et le temps d’accès déterministes.</strong></p>`,
            intuition: `<p>Le cache choisit lui-même ce qu’il garde ; la SPRAM ne contient que ce que le programme décide d’y mettre.</p>`,
            trap: `<p>Dire seulement « le cache et la SPRAM sont de petites mémoires rapides » ne les distingue pas et ne répond pas à la question.</p>`
          },
          {
            n: "P2 · Q2",
            title: "Chronogramme et coût d’un transfert DMA",
            verbatim: true,
            sourcePage: 7,
            prompt: `<p><strong>Question 2 :</strong><br>Dessiner un chronogramme type pour le transfert d’un paquet de <em>n</em> KiOctets depuis la mémoire externe vers la SPRAM. Sur ce chronogramme :</p>
              <ul><li>Dessiner le chronogramme d’une séquence de transfert DMA d’un burst de taille <em>b</em><sub>max</sub> provenant de la mémoire externe et écrites en SPRAM</li><li>Montrer comment synchroniser un DMA avec le logiciel en utilisant une interruption</li></ul>
              <p>Finalement, donner l’équation qui exprime le nombre de cycles minimum pour ce transfert, en fonction de <em>n</em>, <em>l</em><sub>SPRAM</sub>, <em>l</em><sub>m</sub>, <em>b</em><sub>max</sub> et <em>t</em><sub>IT</sub>.</p>`,
            answer: `<h4>1. Transformer les octets en mots de bus</h4>
              <p>Le bus transporte <code>64/8 = 8 octets</code> par cycle de données. Un burst plein de <code>bmax</code> octets contient donc <code>k=bmax/8</code> mots. Avec un seul tampon de la taille d’un burst et un bus partagé, le modèle minimal remplit le tampon depuis la DDR, puis le vide vers la SPRAM.</p>
              <h4>2. Chronogramme demandé</h4>
              <pre><code>temps ───────────────────────────────────────────────────────────────►

DDR → DMA     requête │&lt;── lm ──&gt;│ R0 R1 ... R(k−1)
tampon DMA                       vide ───────► plein
DMA → SPRAM                                  requête │&lt;lSPRAM&gt;│ W0 ... W(k−1)

CPU           configure + START │ travail indépendant .................
DMA                             │ burst 0 │ ... │ dernier burst │ IT↑
CPU                                                                    │&lt;tIT&gt;│ ISR</code></pre>
              <p>L’ISR acquitte l’interruption puis positionne un drapeau, libère un sémaphore ou réveille la tâche consommatrice. Les données ne doivent être utilisées qu’après ce signal de fin.</p>
              <h4>3. Équation du coût</h4>
              <p>Un burst plein coûte :</p>
              <p><code>Cburst = lm + bmax/8 + lSPRAM + bmax/8 = lm + lSPRAM + bmax/4</code>.</p>
              <p>Pour <code>Q=1024n</code> octets et un paquet divisible par <code>bmax</code> :</p>
              <p><strong><code>T(n) = (1024n/bmax)·(lm+lSPRAM+2bmax/8) + tIT</code></strong>.</p>
              <p>La forme robuste avec un dernier burst partiel est :</p>
              <p><strong><code>T = ceil(1024n/bmax)·(lm+lSPRAM) + 2·ceil(1024n/8) + tIT</code></strong>.</p>
              <h4>4. Contrôle numérique avec les valeurs de la suite</h4>
              <p><code>lm=27</code>, <code>lSPRAM=6</code>, <code>bmax=128 B</code> et <code>tIT=856</code>. Un burst contient 16 mots et coûte <code>27+16+6+16=65 cycles</code>. Un Kio contient huit bursts :</p>
              <p><code>T(n)=8n·65+856 = 520n+856 cycles</code>. Pour 1 Kio, on vérifie <code>T=1376 cycles</code>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le DMA lit chaque burst DDR après <code>lm</code>, le stocke, puis l’écrit en SPRAM après <code>lSPRAM</code>. Le paquet complet coûte <code>(1024n/bmax)(lm+lSPRAM+2bmax/8)+tIT</code>, avec une seule interruption finale.</p>`,
            intuition: `<p>Le tampon est un seau : le DMA attend et le remplit depuis la DDR, puis attend et le vide dans la SPRAM. L’interruption n’arrive qu’après le dernier seau.</p>`,
            trap: `<p><code>tIT</code> est payé une fois pour la commande qui transfère tout le paquet, pas une fois par burst interne.</p>`
          }
        ]
      },
      {
        title: "2.2 · Application à la détection de visage",
        theme: "Image intégrale",
        context: `<p>L’image d’entrée <code>I</code> contient des pixels de 8 bits et mesure <code>Ix×Iy</code>. Elle est rangée en ordre canonique (<em>row-major</em>) : <code>adresse(I(x,y)) = x + y·Ix</code>. Les valeurs numériques sont <code>Ix=Iy=256</code>, <code>lm=27</code> cycles, <code>lSPRAM=6</code> cycles, <code>bmax=128 octets</code>, <code>tIT=856</code> cycles et une SPRAM de 32 Kio.</p>
          <p>Le détecteur utilise des zones <code>dx×dy=24×24</code>. L’image intégrale est calculée en deux passes :</p>
          <pre><code>/* 1ere passe : intégrale verticale */
for (x=0; x&lt;Ix; x++) {
    II(x,0) = I(x,0);
    for (y=1; y&lt;Iy; y++)
        II(x,y) = II(x,y-1) + I(x,y);
}

/* 2nde passe : intégrale horizontale */
for (y=0; y&lt;Iy; y++)
    for (x=1; x&lt;Ix; x++)
        II(x,y) = II(x-1,y) + II(x,y);</code></pre>`,
        questions: [
          {
            n: "P2 · Q3",
            title: "Nombre de bits d’un pixel de l’image intégrale",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 3 :</strong><br>Si l’image originale est composée de pixels codés sur 8 bits, combien de bits sont nécessaires pour coder les pixels de l’image intégrale ?</p>
              <p><strong>Indications :</strong></p><ul><li>Donner l’équation théorique du nombre de bits à ajouter, en considérant le pire-cas</li><li>Donner la valeur du nombre de bits en fonction des paramètres précédents</li><li>Prendre une valeur parmi 8, 16 ou 32 bits</li></ul>`,
            answer: `<h4>1. Construire le pire cas</h4>
              <p>La valeur maximale se trouve en bas à droite : elle additionne <code>Ix·Iy</code> pixels, chacun pouvant valoir <code>2⁸−1=255</code>. Donc :</p>
              <p><code>IImax = Ix·Iy·(2⁸−1)</code>.</p>
              <p>La largeur exacte minimale est <code>ceil(log₂(IImax+1))</code>. Une borne simple consiste à ajouter <code>ceil(log₂(Ix·Iy))</code> bits aux 8 bits d’entrée.</p>
              <h4>2. Application numérique</h4>
              <p><code>Ix·Iy=256²=65 536=2¹⁶</code>, donc il faut ajouter 16 bits :</p>
              <p><code>8+16=24 bits</code>.</p>
              <p>Contrôle exact : <code>65 536·255=16 711 680 &lt; 2²⁴=16 777 216</code>, alors que <code>2²³</code> est insuffisant.</p>
              <p>La question impose de choisir 8, 16 ou 32 bits : le premier format capable de contenir 24 bits est <strong>32 bits</strong>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Il faut théoriquement 24 bits, soit 16 bits de plus que l’entrée ; parmi les formats proposés, chaque pixel de l’image intégrale doit être stocké sur 32 bits.</p>`,
            intuition: `<p>Un pixel intégral peut additionner 65 536 pixels : la valeur grossit beaucoup plus qu’un pixel source isolé.</p>`,
            trap: `<p>Ne pas répondre « 24 » sans traiter la dernière consigne : le stockage demandé doit être choisi parmi 8, 16 et 32 bits, donc la réponse finale est 32 bits.</p>`
          },
          {
            n: "P2 · Q4",
            title: "Empreinte mémoire de l’image intégrale",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 4 :</strong><br>Quelle est la taille de la zone mémoire occupée par l’image intégrale ?</p>`,
            answer: `<h4>1. Nombre d’éléments</h4>
              <p>L’image intégrale garde les mêmes dimensions que l’image source : <code>256·256 = 65 536</code> pixels.</p>
              <h4>2. Taille de chaque élément</h4>
              <p>La Q3 impose un stockage sur 32 bits, soit 4 octets. L’empreinte est donc :</p>
              <p><code>65 536·4 = 262 144 octets = 256 Kio</code>.</p>
              <p>À titre de contrôle, même l’image source occupe <code>256²·1=64 Kio</code>. Ni 64 Kio ni 256 Kio ne tiennent dans la SPRAM de 32 Kio.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> <code>|II|=Ix·Iy·4=262 144 octets=256 Kio</code> ; l’image intégrale complète dépasse donc la SPRAM d’un facteur 8.</p>`,
            intuition: `<p>Le nombre de pixels ne change pas, mais chacun passe de 1 octet à 4 octets.</p>`,
            trap: `<p>Ne pas utiliser les 24 bits théoriques comme un format compact de 3 octets : la Q3 impose le format disponible de 32 bits.</p>`
          },
          {
            n: "P2 · Q5",
            title: "Temps de chargement d’une ligne et d’une colonne",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 5 :</strong></p><ul><li>Combien de temps minimum faut-il pour charger une <em>ligne</em> de <em>l</em><sub>x</sub> × 1 pixels dans la SPRAM ?</li><li>Combien de temps minimum faut-il pour charger une <em>colonne</em> de 1 × <em>c</em><sub>y</sub> pixels dans la SPRAM ?</li></ul>
              <p><strong>Indication :</strong> Attention au schéma d’adressage car les pixels d’une colonne ne sont pas à des adresses contiguës.</p>`,
            answer: `<h4>1. Formule pour une zone contiguë</h4>
              <p>Une commande DMA de <code>S</code> octets contigus coûte :</p>
              <p><code>C(S)=33·ceil(S/128)+2·ceil(S/8)+856</code>.</p>
              <p>Les deux latences valent ensemble <code>27+6=33</code> cycles, chaque mot de 8 octets traverse le bus deux fois, et l’interruption est payée une fois à la fin de la commande.</p>
              <h4>2. Ligne de pixels source</h4>
              <p>Une ligne de <code>lx</code> pixels 8 bits occupe <code>S=lx</code> octets contigus :</p>
              <p><strong><code>Tligne,8(lx)=33·ceil(lx/128)+2·ceil(lx/8)+856</code></strong>.</p>
              <p>Pour <code>lx=256</code> : deux bursts, 32 mots transférés dans chaque direction et une interruption :</p>
              <p><code>Tligne,8=2·33+2·32+856 = 986 cycles</code>.</p>
              <h4>3. Colonne de pixels source</h4>
              <p>Deux pixels verticaux sont espacés de <code>Ix=256 octets</code>. Le DMA n’a pas de paramètre de stride : il faut une commande d’un pixel par ligne. Même un octet occupe un beat en lecture et un beat en écriture :</p>
              <p><code>Tpixel=27+1+6+1+856=891 cycles</code>.</p>
              <p><strong><code>Tcolonne,8(cy)=891·cy</code></strong>, donc pour <code>cy=256</code> :</p>
              <p><code>Tcolonne,8=256·891=228 096 cycles</code>.</p>
              <h4>4. Préparer la Q6 : une ligne de II fait 32 bits/pixel</h4>
              <p>La seconde passe relit en réalité une ligne intermédiaire de <code>II</code>. Elle occupe <code>256·4=1024 octets</code> :</p>
              <p><code>Tligne,II=8·33+2·128+856=1 376 cycles</code>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Une ligne source de 256 pixels est contiguë et coûte 986 cycles. Une colonne impose 256 petites commandes et coûte 228 096 cycles. Si la ligne appartient à II en 32 bits, son coût correct est 1 376 cycles.</p>`,
            intuition: `<p>Une ligne est un long train continu ; une colonne oblige le DMA à repartir 256 fois et à repayer 256 interruptions.</p>`,
            trap: `<p>Le bus de 64 bits ne permet pas de transférer « un huitième de cycle » pour un pixel : un transfert d’un octet consomme tout de même un beat.</p>`
          },
          {
            n: "P2 · Q6",
            title: "Temps total des deux passes de l’image intégrale",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 6 :</strong><br>Combien de lignes et colonnes l’algorithme précédent nécessite-t-il de charger ?</p><ul><li>Dans la passe verticale</li><li>Dans la passe horizontale</li></ul><p>En déduire le temps total passé à charger les données pour le calcul de l’image intégrale.</p>`,
            answer: `<h4>1. Passe verticale</h4>
              <p>La boucle extérieure parcourt <code>x=0…255</code> : elle charge donc <strong>256 colonnes</strong> de 256 pixels source. Avec <code>Tcolonne,8=228 096</code> :</p>
              <p><code>TV=256·228 096 = 58 392 576 cycles</code>.</p>
              <h4>2. Passe horizontale — lecture rigoureuse du code</h4>
              <p>La boucle extérieure parcourt <code>y=0…255</code> : elle charge <strong>256 lignes</strong>. Mais le code additionne <code>II(x−1,y)</code> et <code>II(x,y)</code> ; il relit donc les valeurs intermédiaires de l’image intégrale, stockées sur 32 bits d’après Q3. Avec <code>Tligne,II=1 376</code> :</p>
              <p><code>TH=256·1 376 = 352 256 cycles</code>.</p>
              <p><strong><code>Ttotal=58 392 576+352 256=58 744 832 cycles</code></strong>. La passe verticale représente environ 99,4 % du chargement.</p>
              <h4>3. Ambiguïté du sujet et valeur simplifiée</h4>
              <p>La phrase avant Q5 affirme que « l’image originale I doit être chargée par lignes et par colonnes », ce qui peut pousser à compter 8 bits dans les deux passes. Avec cette convention simplifiée :</p>
              <p><code>TH'=256·986=252 416</code> et <code>Ttotal'=58 644 992 cycles</code>.</p>
              <p>La valeur <strong>58 744 832</strong> est cohérente avec le code et Q3 ; la valeur <strong>58 644 992</strong> est celle obtenue si le barème conserve la simplification 8 bits annoncée dans la phrase.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> 256 colonnes coûtent 58 392 576 cycles ; 256 lignes de II en 32 bits coûtent 352 256 cycles ; total rigoureux : 58 744 832 cycles. J’indiquerais explicitement l’hypothèse si le correcteur attend le total simplifié 58 644 992.</p>`,
            intuition: `<p>Le nombre de lignes et de colonnes est le même, mais la passe verticale est presque toute la facture à cause des accès non contigus et des interruptions répétées.</p>`,
            trap: `<p>Ne pas masquer l’ambiguïté : écrire « je compte 32 bits dans la seconde passe, conformément à Q3 et au code » sécurise la copie.</p>`
          }
        ]
      },
      {
        title: "2.3 · Optimisations du détecteur",
        theme: "Tuilage mémoire",
        context: `<p>La détection est maintenant réalisée par tuiles. Une tuile <code>T=(tx,ty)+Tx×Ty</code> représente l’ensemble des origines de fenêtres du détecteur à tester. Pour chaque origine, le détecteur consomme une fenêtre <code>dx×dy=24×24</code>. On ne calcule plus l’image intégrale complète : seule l’image intégrale de la zone source nécessaire à cette tuile est construite.</p>
          <p>Deux formes de même aire sont comparées : <code>TA=16×16</code> et <code>TB=32×8</code>. Dans les résultats principaux de Q10, on suit la convention implicite du sujet : l’image 256×256 est pavée par 256 tuiles et les effets de bord sont négligés.</p>`,
        questions: [
          {
            n: "P2 · Q7",
            title: "Déterminer la zone source nécessaire à une tuile",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 7 :</strong><br>Pour appliquer le détecteur à toutes les zones <em>d</em><sub>x</sub> × <em>d</em><sub>y</sub> dont les origines sont dans une tuile <em>T</em> = (<em>t</em><sub>x</sub>, <em>t</em><sub>y</sub>) + <em>T</em><sub>x</sub> × <em>T</em><sub>y</sub>, quelle est la zone <em>Z</em> de l’image originale nécessaire ?</p><p>Application numérique avec <em>T</em><sub>A</sub> = <em>T</em><sub>x</sub> × <em>T</em><sub>y</sub> = 16 × 16 puis <em>T</em><sub>B</sub> = <em>T</em><sub>x</sub> × <em>T</em><sub>y</sub> = 32 × 8.</p>`,
            answer: `<h4>1. Repérer la dernière fenêtre</h4>
              <p>Dans la tuile, les origines horizontales vont de <code>tx</code> à <code>tx+Tx−1</code>. La fenêtre dont l’origine est la plus à droite occupe encore <code>dx</code> pixels, donc son dernier pixel est en <code>tx+Tx−1+dx−1</code>. La largeur totale depuis <code>tx</code> vaut alors <code>Tx+dx−1</code>. Même raisonnement verticalement.</p>
              <p><strong><code>Z=(tx,ty)+(Tx+dx−1)×(Ty+dy−1)</code></strong>.</p>
              <h4>2. Applications numériques</h4>
              <ul><li><code>TA=16×16</code> : <code>ZA=(tx,ty)+(16+24−1)×(16+24−1) = (tx,ty)+39×39</code>.</li><li><code>TB=32×8</code> : <code>ZB=(tx,ty)+(32+24−1)×(8+24−1) = (tx,ty)+55×31</code>.</li></ul>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> La zone nécessaire est <code>(tx,ty)+(Tx+dx−1)×(Ty+dy−1)</code> ; elle vaut 39×39 pour TA et 55×31 pour TB.</p>`,
            intuition: `<p>La tuile décrit les origines à essayer ; il faut lui ajouter le « débord » de 23 pixels de la dernière fenêtre, pas une fenêtre entière de 24 pixels.</p>`,
            trap: `<p>Écrire <code>Tx+dx</code> compte un pixel de trop. Deux intervalles discrets accolés partagent leur point de départ, d’où le <code>−1</code>.</p>`
          },
          {
            n: "P2 · Q8",
            title: "Mémoire requise pour Z et son image intégrale",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 8 :</strong><br>De quelle quantité de mémoire a-t-on besoin pour stocker dans la SPRAM la zone de pixels <em>Z</em> et l’image intégrale correspondante ?</p><p>Application numérique avec les valeurs précédentes pour les cas <em>T</em><sub>A</sub> et <em>T</em><sub>B</sub>.</p>`,
            answer: `<h4>1. Coût par position</h4>
              <p>Le pixel source occupe 1 octet et son pixel intégral 4 octets. Si les deux tableaux doivent être présents simultanément dans la SPRAM, une position géométrique coûte donc <code>1+4=5 octets</code>.</p>
              <p><code>M(Z)=Zx·Zy·5</code>.</p>
              <h4>2. Cas TA</h4>
              <p><code>39·39=1 521 pixels</code>. La source prend 1 521 B et l’intégrale <code>1 521·4=6 084 B</code> :</p>
              <p><strong><code>MA=7 605 B ≈ 7,43 Kio</code></strong>.</p>
              <h4>3. Cas TB</h4>
              <p><code>55·31=1 705 pixels</code>. La source prend 1 705 B et l’intégrale 6 820 B :</p>
              <p><strong><code>MB=8 525 B ≈ 8,33 Kio</code></strong>.</p>
              <p>Les deux empreintes sont largement inférieures aux 32 Kio disponibles.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> <code>M=5ZxZy</code> ; TA demande 7 605 B et TB 8 525 B. Les deux tuilages tiennent avec leur image intégrale dans la SPRAM.</p>`,
            intuition: `<p>Il faut compter deux tableaux de même géométrie mais pas de même largeur : un octet source et quatre octets d’intégrale.</p>`,
            trap: `<p>Ne pas comparer seulement la zone source aux 32 Kio ; la question demande de conserver aussi l’image intégrale correspondante.</p>`
          },
          {
            n: "P2 · Q9",
            title: "Temps de chargement de la zone Z",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 9 :</strong><br>Combien de temps faut il pour charger en SPRAM les pixels de la zone <em>Z</em> ?</p><p>Application numérique avec les valeurs précédentes pour <em>T</em><sub>A</sub> et <em>T</em><sub>B</sub>.</p>`,
            answer: `<h4>1. Convention retenue : uniquement les pixels utiles</h4>
              <p>La réponse attendue transfère exactement les pixels de Z, <strong>sans surlecture hors de la zone</strong>. Les pixels d’une ligne de Z sont contigus, mais la ligne physique de l’image contient 256 pixels. Entre la fin d’une ligne de Z et le début de la suivante, le DMA doit sauter <code>256−Zx</code> octets. Comme il ne possède pas de stride, chaque ligne exige alors une commande séparée, donc sa propre interruption.</p>
              <h4>2. Zone ZA = 39×39</h4>
              <p>Une ligne de 39 octets tient dans un burst et utilise <code>ceil(39/8)=5</code> mots de bus :</p>
              <p><code>Tligne,A=27+5+6+5+856=899 cycles</code>.</p>
              <p>Il y a 39 lignes : <strong><code>TZA=39·899=35 061 cycles</code></strong>.</p>
              <h4>3. Zone ZB = 55×31</h4>
              <p>Une ligne de 55 octets tient dans un burst et utilise <code>ceil(55/8)=7</code> mots :</p>
              <p><code>Tligne,B=27+7+6+7+856=903 cycles</code>.</p>
              <p>Il y a 31 lignes : <strong><code>TZB=31·903=27 993 cycles</code></strong>.</p>
              <h4>4. Pourquoi on n’utilise pas un intervalle englobant</h4>
              <p>Une autre interprétation consisterait à transférer d’un coup tout l’intervalle mémoire entre le premier et le dernier pixel : <code>(39−1)·256+39=9 767 B</code> pour ZA, soit 5 839 cycles, et <code>(31−1)·256+55=7 735 B</code> pour ZB, soit 4 803 cycles. Elle est plus rapide mais charge des milliers de pixels qui n’appartiennent pas à Z. Les questions suivantes raisonnent sur le volume utile de Z : on conserve donc la convention ligne par ligne.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Avec une commande par ligne, ZA coûte 35 061 cycles et ZB 27 993 cycles. TB est plus rapide malgré davantage de pixels, car elle contient moins de lignes et paie moins d’interruptions.</p>`,
            intuition: `<p>La hauteur coûte beaucoup plus cher que la largeur ici : ajouter quelques mots dans une ligne coûte peu, mais ajouter une ligne repaie 856 cycles d’interruption.</p>`,
            trap: `<p>Ne pas traiter le rectangle Z comme un seul intervalle contigu : le rangement row-major laisse des pixels hors de Z entre deux de ses lignes.</p>`
          },
          {
            n: "P2 · Q10",
            title: "Coût de la détection sur l’image entière",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 10 :</strong><br>En considérant que toute l’image est décomposée en tuiles de taille <em>T</em>, calculer le nombre total de burst et le temps total de chargement pour effectuer la détection sur toute l’image.</p><p>Application numérique avec les valeurs précédentes pour <em>T</em><sub>A</sub> et <em>T</em><sub>B</sub>.</p>`,
            answer: `<h4>1. Nombre de tuiles</h4>
              <p>Le sujet choisit deux tailles qui divisent 256 et ont la même aire :</p>
              <ul><li>TA : <code>(256/16)·(256/16)=16·16=256 tuiles</code> ;</li><li>TB : <code>(256/32)·(256/8)=8·32=256 tuiles</code>.</li></ul>
              <h4>2. Cas TA</h4>
              <p>Chaque zone ZA possède 39 lignes, chacune chargée par un burst partiel. Donc :</p>
              <p><code>Nburst,A=256·39=9 984 bursts</code>.</p>
              <p><code>Ttotal,A=256·35 061 = 8 975 616 cycles</code>.</p>
              <h4>3. Cas TB</h4>
              <p>Chaque zone ZB possède 31 lignes :</p>
              <p><code>Nburst,B=256·31=7 936 bursts</code>.</p>
              <p><code>Ttotal,B=256·27 993 = 7 166 208 cycles</code>.</p>
              <h4>4. Convention de bord</h4>
              <p>Ces valeurs suivent exactement l’instruction « toute l’image est décomposée en tuiles » et négligent le dépassement des fenêtres de 24×24 sur les dernières tuiles. Si seules les origines valides sont autorisées, le domaine d’origines mesure <code>233×233</code> et les tuiles de bord doivent être raccourcies ; il faut alors annoncer cette autre convention avant de recalculer.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Sous la convention de tuiles pleines du sujet : TA demande 9 984 bursts et 8 975 616 cycles ; TB demande 7 936 bursts et 7 166 208 cycles. La forme 32×8 est meilleure car elle réduit le nombre de lignes DMA.</p>`,
            intuition: `<p>Les deux découpages ont 256 tuiles. Leur différence vient donc entièrement du coût d’une tuile : 39 redémarrages DMA contre 31.</p>`,
            trap: `<p>Ne pas multiplier le nombre de pixels par un coût moyen : les 856 cycles fixes sont payés par ligne/commande et dominent le résultat.</p>`
          }
        ]
      },
      {
        title: "2.4 · Optimisation de la mémoire",
        theme: "Blocs & réutilisation",
        context: `<p>Les pixels de l’image source sont maintenant stockés par blocs <code>b=bx×by=16×16</code>. Les 256 pixels d’un bloc sont consécutifs en mémoire. Le but est de réduire le nombre de petits bursts et de réutiliser les blocs communs à deux tuiles voisines.</p>`,
        questions: [
          {
            n: "P2 · Q11",
            title: "Charger un bloc 16×16 depuis la DDR",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 11 :</strong><br>Donner le nombre de burst et le temps nécessaire pour charger un bloc en SPRAM depuis la DDR.</p>`,
            answer: `<h4>1. Taille du bloc</h4>
              <p>Un bloc contient <code>16·16=256</code> pixels de 1 octet, donc 256 octets consécutifs.</p>
              <h4>2. Bursts et mots de bus</h4>
              <p><code>256/128=2 bursts</code> et <code>256/8=32 mots</code>. Les deux bursts appartiennent à une seule commande de 256 octets : on ne paie qu’une interruption finale.</p>
              <p><code>Tbloc=2·(27+6)+2·32+856=66+64+856=986 cycles</code>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Un bloc 16×16 occupe 256 octets, demande 2 bursts de 128 octets et se charge en 986 cycles.</p>`,
            intuition: `<p>Le nouveau rangement transforme 16 petits morceaux de ligne en un paquet compact de 256 octets.</p>`,
            trap: `<p>Deux bursts ne signifient pas deux interruptions : le DMA est programmé une fois pour le bloc entier.</p>`
          },
          {
            n: "P2 · Q12",
            title: "Nombre de blocs par tuile et coût sans réutilisation",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 12 :</strong><br>Pour réaliser le traitement d’une tuile <em>T</em>, combien de blocs sont nécessaires ?</p><p>Calculer le nombre total de burst et le temps total de chargement pour effectuer la détection sur toute l’image.</p>`,
            answer: `<h4>1. Formule exacte tenant compte de l’alignement</h4>
              <p>Pour une zone Z commençant en <code>(tx,ty)</code>, le nombre de blocs intersectés vaut :</p>
              <p><code>Nx=ceil(((tx mod 16)+Zx)/16)</code> et <code>Ny=ceil(((ty mod 16)+Zy)/16)</code>.</p>
              <h4>2. Cas TA = 16×16</h4>
              <p>Les origines sont toujours alignées sur 16. ZA=39×39 demande donc <code>ceil(39/16)²=3·3=9 blocs</code> par tuile.</p>
              <p>Sans réutilisation : <code>256·9=2 304</code> chargements de blocs, donc <strong>4 608 bursts</strong> et :</p>
              <p><strong><code>2 304·986=2 271 744 cycles</code></strong>.</p>
              <h4>3. Cas TB = 32×8 : l’alignement alterne</h4>
              <p>Horizontalement, <code>tx</code> est multiple de 32 : ZB=55 pixels demande toujours <code>ceil(55/16)=4</code> blocs. Verticalement, <code>ty</code> avance par 8 :</p>
              <ul><li>si <code>ty mod 16=0</code>, les 31 lignes occupent 2 rangées : <code>4·2=8 blocs</code> ;</li><li>si <code>ty mod 16=8</code>, elles chevauchent 3 rangées : <code>4·3=12 blocs</code>.</li></ul>
              <p>Sur les 32 positions verticales, 16 sont de chaque type. Avec 8 positions horizontales :</p>
              <p><code>Nblocs,B=8·(16·8+16·12)=2 560</code>.</p>
              <p>Il faut donc <strong><code>5 120 bursts</code></strong> et <strong><code>2 560·986=2 524 160 cycles</code></strong>.</p>
              <h4>4. Valeur simplifiée parfois attendue</h4>
              <p>Si l’on suppose à tort toutes les tuiles TB alignées sur les blocs, on trouve 8 blocs/tuile, 4 096 bursts et 2 019 328 cycles. La réponse rigoureuse doit signaler que le pas vertical de 8 pixels alterne les cas 8 et 12 blocs.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Sans réutilisation, TA demande 4 608 bursts et 2 271 744 cycles. En tenant compte de l’alignement 8 pixels de TB, celle-ci demande 5 120 bursts et 2 524 160 cycles.</p>`,
            intuition: `<p>Une tuile TB sur deux commence au milieu d’une rangée de blocs : sa zone de 31 pixels déborde alors sur une troisième rangée.</p>`,
            trap: `<p>Le calcul <code>ceil(31/16)=2</code> n’est valable que si le premier pixel est aligné sur une frontière de bloc.</p>`
          },
          {
            n: "P2 · Q13",
            title: "Réutiliser les blocs entre tuiles voisines",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 13 :</strong><br>Peut on réutiliser des blocs lorsque l’on passe d’une tuile à un autre ? Donner le gain apporté par une stratégie de réutilisation efficace.</p>`,
            answer: `<h4>1. Pourquoi la réutilisation est possible</h4>
              <p>Oui : les zones Z de deux tuiles voisines se chevauchent fortement. Pour TA, une fenêtre de 3×3 blocs décalée d’un bloc conserve 6 blocs et n’en demande que 3 nouveaux. Pour TB, un déplacement horizontal de deux blocs conserve deux des quatre colonnes de blocs.</p>
              <h4>2. Stratégie efficace</h4>
              <p>Parcourir les tuiles en bandes et conserver en SPRAM les rangées de blocs encore utiles. Avec le padding implicite des tuiles pleines, une bande de trois rangées sur 18 colonnes occupe :</p>
              <p><code>3·18 blocs·256 B = 13 824 B = 13,5 Kio</code>.</p>
              <p>Même avec l’image intégrale locale la plus grande (<code>6 820 B</code> pour TB), on reste sous 32 Kio. Cette capacité permet de conserver la bande active et de ne charger chaque bloc source — ou bloc de padding — qu’une seule fois avant sa dernière utilisation.</p>
              <h4>3. Gain cohérent avec les 256 tuiles pleines de Q10–Q12</h4>
              <p>Pour tester aussi les origines proches des bords, les halos de 23 pixels imposent un padding à droite et en bas. La couverture totale vaut <code>279×279</code> pixels, soit <code>18×18=324 blocs</code> distincts. Une stratégie optimale ne charge chacun qu’une fois :</p>
              <p><code>Nburst=324·2=648</code> et <code>Tréutilisé=324·986=319 464 cycles</code>.</p>
              <ul><li>gain TA : <code>2 304/324 = 64/9 ≈ 7,11</code> ;</li><li>gain TB : <code>2 560/324 = 640/81 ≈ 7,90</code>.</li></ul>
              <h4>4. Variante sans padding</h4>
              <p>Si l’on ne teste que les fenêtres entièrement comprises dans l’image, seuls les 256 blocs physiques sont uniques : 512 bursts et 252 416 cycles. Mais les tuiles de bord contiennent alors moins d’origines ; il faut aussi recalculer les dénominateurs sans réutilisation de Q10–Q12 avant d’annoncer un gain. On ne peut pas mélanger cette variante avec les 256 tuiles pleines.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Oui. En rendant explicite une convention de padding compatible avec les 256 tuiles pleines de Q10–Q12, une conservation par bandes réduit le chargement à 324 blocs, soit 648 bursts et 319 464 cycles : gain ≈7,11 pour TA et ≈7,90 pour TB.</p>`,
            intuition: `<p>Au lieu de jeter tout le rectangle quand la tuile bouge, on garde sa grande zone de recouvrement et on ne charge que la nouvelle frontière.</p>`,
            trap: `<p>Un « gain efficace » doit préciser la mémoire conservée et la convention de bord ; un simple ratio sans stratégie ni hypothèse est fragile.</p>`
          }
        ]
      },
    ]
  }
];
