import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useRef } from 'react';
import { type } from '@testing-library/user-event/dist/type';

export default function Treemap({ width='500px', height='700px' }) {
  const svgRef = useRef(null);
  const [skillname, setSkillname] = useState([]);
  const [data, setData] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [employeeNames, setEmployeeNames] = useState([]);
  
  useEffect(() => {
    fetch('http://13.234.20.12:8080/api/v1/skillmaster')
      .then(response => response.json())
      .then(data => {
        const skills = data.map(item => item.skillName);
        setSkillname(skills);
      })
      .catch(error => {
        console.error('Error fetching skill data:', error);
      });
  }, []);

  useEffect(() => {
    if (skillname.length === 0) {
      return; // No skills to fetch employee count for
    }

    Promise.all(
      skillname.map(skill =>
        fetch(`http://13.234.20.12:8080/api/v1/skillemp/EmpSkill/${skill}`)
          .then(response => response.json())
          .then(employeeData => {
            const skillCount = employeeData.length;
            return { skillname: skill, value: skillCount };
          })
          .catch(error => {
            console.error(`Error fetching employee count for ${skill}:`, error);
            return { skillname: skill, value: 0 };
          })
      )
    ).then(skillCounts => {
      const nonZeroSkillCounts = skillCounts.filter(skill => skill.value > 0);
      setData(nonZeroSkillCounts);
    });
  }, [skillname]);

  useEffect(() => {
    if (!data || !data.length) {
      return; // No data to create treemap
    }

    const root = d3.hierarchy({
      children: data
    })
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemapRoot = d3
      .treemap()
      .size([width, height])
      .padding(1)(root);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Change the color scheme as needed

    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove(); // Clear previous content

    const cell = svg
      .selectAll('g')
      .data(treemapRoot.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .on('click', function(d){
      const va=d3.select(this);
      const skillname = va.data()[0].data.skillname; // Get the skillname from clickedElement's data
         setSelectedSkill(skillname);
             fetch(`http://13.234.20.12:8080/api/v1/skillemp/EmpSkill/${skillname}`)
               .then(response => response.json())
               .then(employeeData => {
                 // const employeeNames = employeeData.map(item => item.empName);
                  //  console.log(employeeNames)
                 setEmployeeNames(employeeData);
               })
               .catch(error => {
                console.error(`Error fetching employee names for ${skillname}:`, error);
                 setEmployeeNames([]);
               });
      });
      
      

    cell.filter(d => d.value > 0 && (d.x1 - d.x0) > 1 && (d.y1 - d.y0) > 1)
      .append('rect')
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.skillname)); // Use color scale based on skillname

    cell.filter(d => d.value > 0 && (d.x1 - d.x0) > 1 && (d.y1 - d.y0) > 1)
      .append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data(d => d.data.skillname.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + i * 10)
      .text(d => d);

      // cell.filter(d=>{
      //   console.log(d.data.skillname)
      // })

    cell.filter(d => d.value > 0 && (d.x1 - d.x0) > 1 && (d.y1 - d.y0) > 1)
      .append('text')
      .attr('class', 'value-text')
      .attr('x', 4)
      .attr('y', 35) // Adjust the y-coordinate as needed
      .text(d => d.value);
  }, [data, width, height]);


 
  return (
    <div>
      <svg ref={svgRef} width={width} height={height} />
      <div style={{
        position: 'absolute',
        left: '800px',

    top: '0px'}}>
  {employeeNames.length > 0 && (
    <div>
      <h3 >Employees under {selectedSkill} skill:</h3>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Proficeny Level</th>
          </tr>
        </thead>
        <tbody>
          {employeeNames.map(employee => (
            <tr key={employee.SkillId}>
              <td>{employee.empName}</td>
              <td>{employee.proficiencyLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>
      {`
          table {
            border-collapse: collapse;
            width: 100%;
          }

          th, td {
            padding: 14px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }

          th {
            background-color: #f2f2f2;
          }

          tr:hover {
            background-color: #f5f5f5;
          }
        `}
      </style>
    </div>
  )}
</div>

    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import * as d3 from 'd3';
// import { useRef } from 'react';

// export default function Treemap({ width, height }) {
//   const svgRef = useRef(null);
//   const [skillname, setSkillname] = useState([]);
//   const [data, setData] = useState([]);
//   const [selectedSkill, setSelectedSkill] = useState(null);
//   const [employeeNames, setEmployeeNames] = useState([]);

//   useEffect(() => {
//     fetch('http://13.234.20.12:8080/api/v1/skillmaster')
//       .then(response => response.json())
//       .then(data => {
//         const skills = data.map(item => item.skillName);
//         setSkillname(skills);
//       })
//       .catch(error => {
//         console.error('Error fetching skill data:', error);
//       });
//   }, []);

//   useEffect(() => {
//     if (skillname.length === 0) {
//       return;
//     }

//     Promise.all(
//       skillname.map(skill =>
//         fetch(`http://13.234.20.12:8080/api/v1/skillemp/EmpSkill/${skill}`)
//           .then(response => response.json())
//           .then(employeeData => {
//             const skillCount = employeeData.length;
//             return { skillname: skill, value: skillCount };
//           })
//           .catch(error => {
//             console.error(`Error fetching employee count for ${skill}:`, error);
//             return { skillname: skill, value: 0 };
//           })
//       )
//     ).then(skillCounts => {
//       const nonZeroSkillCounts = skillCounts.filter(skill => skill.value > 0);
//       setData(nonZeroSkillCounts);
//     });
//   }, [skillname]);

//   useEffect(() => {
//     if (!data || !data.length) {
//       return;
//     }
//    // console.log(data)
//     const root = d3.hierarchy({
//       children: data
//     })
//       .sum(d => d.value)
//       .sort((a, b) => b.value - a.value);

//     const treemapRoot = d3
//       .treemap()
//       .size([width, height])
//       .padding(1)(root);

//     const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
//   //  console.log(skillname)
//     const svg = d3.select(svgRef.current);

//     svg.selectAll('*').remove();

//     const cell = svg
//       .selectAll('g')
//       .data(treemapRoot.leaves())
//       .enter()
//       .append('g')
//       .attr('transform', d => `translate(${d.x0},${d.y0})`)
//       .on('click', d => {
//         console.log('Clicked Data:', d.data);
//         if (d.data && d.data.children) {
//           console.log('Clicked Skill:', d.data.children[0].data.skillname);
//           handleSkillClick(d.data.children[0].data.skillname);
//         } else {
//           console.log('No data available for this cell.');
//         }
//       });
//       console.log(cell)
//     cell.filter(d => d.value > 0 && (d.x1 - d.x0) > 1 && (d.y1 - d.y0) > 1)
//       .append('rect')
//       .attr('class', 'tile')
//       .attr('width', d => d.x1 - d.x0)
//       .attr('height', d => d.y1 - d.y0)
//       .attr('fill', d => colorScale(d.data.skillname));


//     cell.filter(d => d.value > 0 && (d.x1 - d.x0) > 1 && (d.y1 - d.y0) > 1)
//       .append('text')
//       .attr('class', 'tile-text')
//       .selectAll('tspan')
//       .data(d => d.data.skillname.split(/(?=[A-Z][^A-Z])/g))
//       .enter()
//       .append('tspan')
//       .attr('x', 4)
//       .attr('y', (d, i) => 13 + i * 10)
//       .text(d => d);

//     cell.filter(d => d.value > 0 && (d.x1 - d.x0) > 1 && (d.y1 - d.y0) > 1)
//       .append('text')
//       .attr('class', 'value-text')
//       .attr('x', 4)
//       .attr('y', 35)
//       .text(d => d.value);
//   }, [data, width, height]);

//   const handleSkillClick = skill => {
//     //console.log(sill)
//     setSelectedSkill(skill);
//     fetch(`http://13.234.20.12:8080/api/v1/skillemp/EmpSkill/${skill}`)
//       .then(response => response.json())
//       .then(employeeData => {
//         const employeeNames = employeeData.map(item => item.employeeName);
//         setEmployeeNames(employeeNames);
//       })
//       .catch(error => {
//         console.error(`Error fetching employee names for ${skill}:`, error);
//         setEmployeeNames([]);
//       });
//   };

//   return (
//     <div>
//       <svg ref={svgRef} width={width} height={height} />
//       <div>
//         {employeeNames.length > 0 && (
//           <div>
//             <h3>Employees under {selectedSkill} skill:</h3>
//             <ul>
//               {employeeNames.map(employee => (
//                 <li key={employee}>{employee}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
