import React from 'react';
import '../styles/About.css';
import Body from '../components/Body.js';
import Container from '../components/Container.js';

function About() {
  return (
    <>
  
        <body>       
    <main>
        <section>
            <h2>Project Overview</h2>
            <p>
                The Bacteria Proteome Comparison application is designed to analyze and compare the protein amino acid sequences of different bacteria. This tool focuses on counting the number of similar k-mers (specifically, 6-mers) within these sequences to assess their similarities.
            </p>
        </section>
        
        <section>
            <h2>Current Functionality</h2>
            <p>
                As a proof of concept, the application currently compares the amino acid sequences of two bacteria. The core functionality involves:
            </p>
            <ul>
                <li>Extracting 6-mers from protein sequences.</li>
                <li>Counting the occurrences of 6-mers in each of the two bacteria.</li>
                <li>Providing a similarity score based on these comparisons.</li>
            </ul>
        </section>
        
        <section>
            <h2>Future Goals</h2>
            <p>
                The ultimate goal of this project is to expand the comparison capabilities to include multiple bacteria. Future enhancements include:
            </p>
            <ul>
                <li>Comparing protein sequences across a broader range of bacterial species.</li>
                <li>Building a phylogenetic tree based on similarity scores to visualize evolutionary relationships.</li>
                <li>Integrating additional features for a comprehensive analysis of bacterial proteomes.</li>
            </ul>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Bacteria Proteome Comparison Project</p>
    </footer>
</body>
    </>
  );
}

export default About;
